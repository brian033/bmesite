import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ImportantDate } from "@/types/importantDate";

// 處理 POST 請求的函數
const postHandler = async (req: NextRequest, session: any) => {
    try {
        const data = await req.json();

        // 基本驗證
        if (!data.title || !data.date || !data.displayText) {
            return NextResponse.json(
                { error: "請提供有效的標題、日期和顯示文字" },
                { status: 400 }
            );
        }

        // 驗證日期格式 (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            return NextResponse.json({ error: "日期格式必須為 YYYY-MM-DD" }, { status: 400 });
        }

        // 如果有延長日期，同樣驗證原始日期格式
        if (
            data.isExtended &&
            data.originalDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.originalDate)
        ) {
            return NextResponse.json({ error: "原始日期格式必須為 YYYY-MM-DD" }, { status: 400 });
        }

        // 準備要插入的重要日期數據
        const importantDate: ImportantDate = {
            title: data.title.trim(),
            date: data.date,
            displayText: data.displayText.trim(),
            isExtended: !!data.isExtended,
            originalDate: data.isExtended ? data.originalDate : undefined,
            originalDisplayText: data.isExtended ? data.originalDisplayText : undefined,
        };

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const result = await db.collection("importantDates").insertOne({
            ...importantDate,
            createdAt: new Date(),
            createdBy: session.user.email,
        });

        return NextResponse.json({ success: true, _id: result.insertedId }, { status: 201 });
    } catch (err) {
        console.error("新增重要日期時發生錯誤:", err);
        return NextResponse.json(
            { error: "伺服器內部錯誤", details: (err as Error).message },
            { status: 500 }
        );
    }
};

// 處理 DELETE 請求的函數
const deleteHandler = async (req: NextRequest, session: any) => {
    try {
        // 從請求體中獲取標題
        const data = await req.json();
        const { title } = data;

        if (!title || typeof title !== "string") {
            return NextResponse.json({ error: "請提供有效的重要日期標題" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 使用標題執行刪除操作
        const result = await db.collection("importantDates").deleteOne({ title });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "找不到對應標題的重要日期或已被刪除" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `重要日期「${title}」已成功刪除`,
        });
    } catch (err) {
        console.error("刪除重要日期時發生錯誤:", err);
        return NextResponse.json(
            { error: "伺服器內部錯誤", details: (err as Error).message },
            { status: 500 }
        );
    }
};

// 導出 HTTP 方法處理函數
export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, postHandler);
export const DELETE = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, deleteHandler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
