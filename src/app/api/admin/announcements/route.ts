// src/app/api/admin/announcements/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Announcement } from "@/types/announcement";

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
export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, getHandler);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
