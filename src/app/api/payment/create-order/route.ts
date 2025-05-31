import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { Payment, ECPayFormParams } from "@/types/payment";
import { middlewareFactory } from "@/lib/middlewareFactory";
import { v4 } from "uuid";
import { updateUserPaymentStatus } from "@/lib/updateUserPaymentStatus";
import { User } from "@/types/user";
import { PaymentOption } from "@/types/paymentOption";

// 綠界支付配置 (應放在環境變數中)
const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "3002607";
const HASH_KEY = process.env.ECPAY_HASH_KEY || "pwFHCqoQZGmho4w6";
const HASH_IV = process.env.ECPAY_HASH_IV || "EkRm7iFT261dpevs";
const ECPAY_API_URL =
    process.env.ECPAY_API_URL || "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

const RETURN_URL = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/return`
    : "http://localhost:3000/api/payment/return";

export function getCheckMac(params: any): string {
    // 1. 過濾不需要加入檢查碼的參數
    const filteredParams = Object.fromEntries(
        Object.entries(params)
            .filter(([key]) => key !== "CheckMacValue")
            .map(([key, value]) => [key, value.toString()])
    );

    // 2. 將參數按照參數名稱的字母順序排序
    const sortedParams = Object.keys(filteredParams)
        .sort()
        .reduce((acc, key) => {
            acc[key] = filteredParams[key];
            return acc;
        }, {} as Record<string, string>);

    // 3. 將排序後的參數組合成字串，並加上 HashKey 和 HashIV
    const paramStr = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    const rawString = `HashKey=${HASH_KEY}&${paramStr}&HashIV=${HASH_IV}`;

    // 4. 將字串進行 URL encode
    let encoded = encodeURIComponent(rawString).toLowerCase();

    // 5. 特殊字元還原，符合 .NET 的 URL 編碼規則
    encoded = encoded
        .replace(/%20/g, "+")
        .replace(/%21/g, "!")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%2a/g, "*")
        .replace(/%2d/g, "-")
        .replace(/%2e/g, ".")
        .replace(/%5f/g, "_");

    // 6. 使用 SHA256 計算雜湊值
    const hash = crypto.createHash("sha256");
    hash.update(encoded);
    const checkMacValue = hash.digest("hex").toUpperCase();

    return checkMacValue;
}
// 格式化日期為 yyyy/MM/dd HH:mm:ss
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

const handler = async (req: NextRequest, session: any) => {
    try {
        // 解析請求體
        const body = await req.json();
        const { paymentOptionId }: { paymentOptionId: string } = body;

        const userId = session.user.uuid; // 從session獲取用戶ID
        // create a unique paymentId
        const paymentId = v4(); // 生成一個標準 UUID，例如 "123e4567-e89b-12d3-a456-426614174000"
        const formattedPaymentId = paymentId.replace(/-/g, "").substring(0, 20);
        // 結果會像 "123e4567e89b12d3a456"
        // 格式化當前時間為綠界要求的格式
        const now = new Date();

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 1. 先檢查DB的payment選項
        const paymentOption = (await db.collection("paymentOptions").findOne({
            paymentOptionId: paymentOptionId,
        })) as PaymentOption | null;

        if (!paymentOption) {
            return NextResponse.json(
                { success: false, message: "Invalid payment option or expired" },
                { status: 400 }
            );
        } else {
            // 檢查開始時間 (如果設置了)
            if (now < paymentOption.validFrom) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Payment option is not yet active",
                        activeFrom: paymentOption.validFrom,
                    },
                    { status: 400 }
                );
            }

            // 檢查結束時間 (如果設置了)
            if (now > paymentOption.goodUntil) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Payment option has expired",
                        expiredAt: paymentOption.goodUntil,
                    },
                    { status: 400 }
                );
            }
        }
        // 能跑到這邊就代表這個選項是存在且在期限內的

        // 接下來檢查用戶是否已經存在付款記錄
        // 先更新使用者的狀態
        await updateUserPaymentStatus(userId);
        const userOnDB: User = (await db.collection("users").findOne({
            uuid: userId,
        })) as User;

        // 如果他已經paid就不要給他再付錢了
        const userAlreadyPaid = userOnDB.payment.paid;
        if (userAlreadyPaid) {
            return NextResponse.json(
                { success: false, message: "User has already paid." },
                { status: 400 }
            );
        }

        // 接下來constructpayment parameters
        const formattedDate = formatDate(now);
        let paymentParams: ECPayFormParams = {
            MerchantID: MERCHANT_ID,
            MerchantTradeNo: formattedPaymentId,
            MerchantTradeDate: formattedDate,
            PaymentType: "aio",
            TotalAmount: paymentOption.price,
            TradeDesc: paymentOption.tradeDescription,
            ItemName: paymentOption.itemName,
            ReturnURL: RETURN_URL,
            ChoosePayment: "ALL",
            CheckMacValue: "TBA",
            EncryptType: 1,
        };
        paymentParams.CheckMacValue = getCheckMac(paymentParams);
        console.log("paymentParams", paymentParams);
        // 連接到 MongoDB

        const paymentRecord: Payment = {
            paymentId: formattedPaymentId,
            paymentOwner: userId,
            paymentStatus: "created",
            paymentValue: paymentParams.TotalAmount,
            paymentType: paymentOption.paymentOptionId,
            paymentParams: paymentParams,
        };

        // 將付款記錄插入到 MongoDB
        await db.collection("payments").insertOne(paymentRecord);
        await db.collection("users").updateOne(
            { uuid: userId },
            {
                $push: {
                    "payment.payment_id": formattedPaymentId,
                },
            }
        );
        return NextResponse.json({
            success: true,
            paymentId: formattedPaymentId,
            formData: paymentParams,
            paymentUrl: ECPAY_API_URL,
        });
    } catch (err) {
        console.error("產生付款連結錯誤", err);
        return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
    }
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
