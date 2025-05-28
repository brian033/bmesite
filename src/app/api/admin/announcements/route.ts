// src/app/api/admin/announcements/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Announcement } from "@/types/announcement";
import { ObjectId } from "mongodb";

const getHandler = async (req: NextRequest, session: any) => {
    try {
        const data = await req.json();
        // 基本驗證
        if (!data.title || !data.lines || !Array.isArray(data.lines) || data.lines.length === 0) {
            return NextResponse.json({ error: "請提供有效的公告標題和內容" }, { status: 400 });
        }
        // 準備要插入的公告數據
        const announcement: Announcement = {
            title: data.title,
            lines: data.lines,
        };
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const result = await db.collection("announcements").insertOne(announcement as any);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

// 修改刪除處理函數，使用公告標題篩選並刪除
const deleteHandler = async (req: NextRequest, session: any) => {
    try {
        // 從請求體中獲取標題
        const data = await req.json();
        const { title } = data;

        if (!title || typeof title !== "string") {
            return NextResponse.json({ error: "請提供有效的公告標題" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 使用標題執行刪除操作
        const result = await db.collection("announcements").deleteOne({ title });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "找不到對應標題的公告或已被刪除" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `公告「${title}」已成功刪除`,
        });
    } catch (err) {
        console.error("刪除公告時發生錯誤:", err);
        return NextResponse.json(
            { error: "伺服器內部錯誤", details: (err as Error).message },
            { status: 500 }
        );
    }
};

export const DELETE = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, deleteHandler);

export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, getHandler);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
