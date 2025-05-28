import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ImportantDate } from "@/types/importantDate";

const handler = async (req: NextRequest, session: any) => {
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

export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
