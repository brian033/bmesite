import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 獲取所有重要日期，並按照日期排序（最近的在前）
        const importantDates = await db
            .collection("importantDates")
            .find({})
            .sort({ date: 1 }) // 按日期升序排序
            .toArray();

        // 將 MongoDB ObjectId 轉換為字串，確保 JSON 序列化不出錯
        const serializedDates = importantDates.map((item) => ({
            ...item,
            _id: item._id.toString(),
            // 確保日期相關欄位正確處理
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
        }));

        // 返回 JSON 響應
        return NextResponse.json(serializedDates);
    } catch (error) {
        console.error("從資料庫獲取重要日期時發生錯誤:", error);

        // 返回錯誤響應
        return NextResponse.json(
            { error: "獲取重要日期失敗", details: (error as Error).message },
            { status: 500 }
        );
    }
}

// 設置 CORS 頭部
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
