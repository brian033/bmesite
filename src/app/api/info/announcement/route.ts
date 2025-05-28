import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 獲取所有公告，並依照創建時間降序排序（最新的在前面）
        const announcements = await db
            .collection("announcements")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // 將 MongoDB ObjectId 轉換為字串，確保 JSON 序列化不出錯
        const serializedAnnouncements = announcements.map((announcement) => ({
            ...announcement,
            _id: announcement._id.toString(),
            // 確保日期格式化為 ISO 字符串
            createdAt: announcement.createdAt
                ? new Date(announcement.createdAt).toISOString()
                : undefined,
            updatedAt: announcement.updatedAt
                ? new Date(announcement.updatedAt).toISOString()
                : undefined,
        }));

        // 返回 JSON 響應
        return NextResponse.json(serializedAnnouncements);
    } catch (error) {
        console.error("從資料庫獲取公告時發生錯誤:", error);

        // 返回錯誤響應
        return NextResponse.json(
            { error: "獲取公告失敗", details: (error as Error).message },
            { status: 500 }
        );
    }
}
