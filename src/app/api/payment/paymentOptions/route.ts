import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { middlewareFactory } from "@/lib/middlewareFactory";
import { PaymentOption } from "@/types/paymentOption";

/**
 * 處理請求獲取可用的付款選項
 * @param req NextRequest 對象
 * @param session 用戶會話信息
 * @returns 包含可用付款選項的響應
 */
const handler = async (req: NextRequest, session: any) => {
    try {
        // 獲取當前時間
        const now = new Date();

        // 連接到 MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 查詢當前有效的付款選項
        // 條件：validFrom <= now <= goodUntil
        const availableOptions = (await db
            .collection("paymentOptions")
            .find({
                $and: [
                    { validFrom: { $lte: now } }, // 開始時間已到或未設置
                    { goodUntil: { $gte: now } }, // 結束時間未到或未設置
                ],
            })
            .sort({ displayOrder: 1 }) // 按照顯示順序排序
            .toArray()) as PaymentOption[];

        // 如果沒有找到任何可用選項
        if (availableOptions.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No payment options available at this time",
                    availableOptions: [],
                },
                { status: 404 }
            );
        }

        // 返回可用的付款選項
        return NextResponse.json({
            success: true,
            message: "Available payment options retrieved successfully",
            availableOptions: availableOptions,
        });
    } catch (err) {
        console.error("獲取付款選項錯誤", err);
        return NextResponse.json(
            {
                success: false,
                error: "伺服器內部錯誤",
            },
            { status: 500 }
        );
    }
};

// 使用中間件處理 GET 請求
export const GET = middlewareFactory({ cors: true, auth: true }, handler);

// 處理 OPTIONS 請求（支持 CORS 預檢請求）
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
