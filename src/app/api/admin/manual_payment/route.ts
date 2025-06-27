import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendTemplateEmail } from "@/lib/mailTools";

interface ManualPaymentBody {
    userId: string;
    amount: number;
    note: string; // 付款備註（例如：銀行轉帳後五碼）
}

const handler = async (req: NextRequest, session: any) => {
    try {
        const body: ManualPaymentBody = await req.json();
        const { userId, amount, note } = body;

        // 驗證請求內容
        if (!userId || !amount || !note) {
            return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
        }

        // 金額必須為正數
        if (amount <= 0) {
            return NextResponse.json({ error: "金額必須大於 0" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 檢查用戶是否存在
        const user = await db.collection("users").findOne({ uuid: userId });
        if (!user) {
            return NextResponse.json({ error: "找不到指定用戶" }, { status: 404 });
        }
        if (user.payment?.paid) {
            return NextResponse.json({ error: "用戶已經有付款紀錄" }, { status: 400 });
        }

        const paymentId = uuidv4(); // 生成一個標準 UUID，例如 "123e4567-e89b-12d3-a456-426614174000"
        const formattedPaymentId = paymentId.replace(/-/g, "").substring(0, 20);

        // 建立付款紀錄
        const paymentRecord = {
            paymentId: formattedPaymentId,
            paymentOwner: userId,
            paymentStatus: "paid" as const,
            paymentValue: amount,
            paymentType: `manual-${note}`,
            paymentParams: "manual-payment",
            updatedAt: new Date().toISOString(),
            createdBy: session.user.email, // 記錄是哪個管理員建立的
            createdAt: new Date().toISOString(),
        };

        // 寫入付款紀錄
        await db.collection("payments").insertOne(paymentRecord);

        // 更新用戶的付款狀態
        await db.collection("users").updateOne(
            { uuid: userId },
            {
                $set: {
                    "payment.paid": true,
                    "payment.updatedAt": new Date().toISOString(),
                    "payment.updatedBy": session.user.email,
                },
            }
        );

        // 發送付款確認郵件
        await sendTemplateEmail(
            "payment-confirmation",
            {
                name: user.name,
                paymentId: paymentRecord.paymentId,
                paymentItem: "手動登記付款",
                amount: amount,
                note: note,
            },
            {
                to: user.contact_email,
                subject: "2025生機與農機學術研討會-繳費確認通知",
            }
        );

        return NextResponse.json({
            success: true,
            message: "付款紀錄已建立",
            payment: paymentRecord,
        });
    } catch (error) {
        console.error("建立手動付款紀錄時發生錯誤:", error);
        return NextResponse.json({ error: "內部伺服器錯誤" }, { status: 500 });
    }
};

// 套用 CORS + 身份驗證 + 管理員角色驗證
export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);

// 處理 CORS preflight
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
