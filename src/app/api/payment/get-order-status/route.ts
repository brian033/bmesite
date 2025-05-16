import { NextRequest, NextResponse } from "next/server";
import { getCheckMac } from "../create-order/route";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { sendTemplateEmail } from "@/lib/mailTools";

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "3002607";
const ECPAY_QUERY_API_URL =
    process.env.ECPAY_QUERY_API_URL ||
    "https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5";
/**
 * 判斷訂單是否已付款
 * @param responseData 綠界返回的響應數據
 */
function checkPaymentStatus(responseData: Record<string, string>) {
    // 只有 TradeStatus 為 "1" 時才算已付款
    if (responseData.TradeStatus === "1") {
        return {
            isPaid: true,
            status: "paid",
        };
    } else if (responseData.TradeStatus === "0") {
        return {
            isPaid: false,
            status: "created",
        };
    } else if (responseData.TradeStatus === "10200095") {
        return {
            isPaid: false,
            status: "failed",
        };
    }
}

const handler = async (req: NextRequest) => {
    try {
        // 從URL參數獲取商家交易編號
        const url = new URL(req.url);
        const merchantTradeNo = url.searchParams.get("MerchantTradeNo");

        if (!merchantTradeNo) {
            return NextResponse.json(
                { success: false, error: "缺少 MerchantTradeNo 參數" },
                { status: 400 }
            );
        }

        const timestamp = Math.floor(Date.now() / 1000).toString();

        // 準備查詢參數
        const queryParams = {
            MerchantID: MERCHANT_ID,
            MerchantTradeNo: merchantTradeNo,
            TimeStamp: timestamp,
            PlatformID: "",
        };

        // 計算查詢參數的檢查碼
        const checkMacValue = getCheckMac(queryParams);

        // 將參數轉換為表單格式
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(queryParams)) {
            formData.append(key, value.toString());
        }
        formData.append("CheckMacValue", checkMacValue);

        // 使用內建的fetch API發送請求
        const response = await fetch(ECPAY_QUERY_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        // 檢查響應狀態
        if (!response.ok) {
            throw new Error(`綠界API返回錯誤: ${response.status} ${response.statusText}`);
        }

        // 解析響應內容
        const responseText = await response.text();

        // 將類似 "Key1=Value1&Key2=Value2" 的響應轉換為對象
        const responseData = Object.fromEntries(
            responseText
                .split("&")
                .filter(Boolean)
                .map((pair) => {
                    const parts = pair.split("=");
                    const key = decodeURIComponent(parts[0] || "");
                    const value = decodeURIComponent(parts[1] || "");
                    return [key, value];
                })
                .filter(([key]) => key) // 過濾掉空鍵
        );

        // 判斷支付狀態
        const paymentStatus = checkPaymentStatus(responseData);
        if (paymentStatus.status === "failed") {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);

            // 更新支付記錄
            await db.collection("payments").updateOne(
                { paymentId: merchantTradeNo },
                {
                    $set: {
                        paymentStatus: "failed",
                        updatedAt: new Date(),
                        ecpayResponse: responseData,
                    },
                }
            );
        }

        // 如果訂單已付款，更新我們的數據庫
        if (paymentStatus.isPaid) {
            try {
                const client = await clientPromise;
                const db = client.db(process.env.MONGODB_DB);

                // 更新支付記錄
                await db.collection("payments").updateOne(
                    { paymentId: merchantTradeNo },
                    {
                        $set: {
                            paymentStatus: "paid",
                            updatedAt: new Date(),
                            ecpayResponse: responseData,
                        },
                    }
                );

                // 查找並更新用戶的付款狀態
                const payment = await db
                    .collection("payments")
                    .findOne({ paymentId: merchantTradeNo });
                if (payment && payment.paymentOwner) {
                    const usermodRes = await db.collection("users").updateOne(
                        { uuid: payment.paymentOwner },
                        {
                            $set: { "payment.paid": true },
                        }
                    );
                    // if modified count == 1, means it's from false to true, so we can inform the user
                    if (usermodRes.modifiedCount === 1) {
                        const user = await db
                            .collection("users")
                            .findOne({ uuid: payment.paymentOwner });
                        await sendTemplateEmail(
                            "payment-confirmation",
                            {
                                name: user.name,
                                paymentId: payment.paymentId,
                                paymentItem:
                                    payment.paymentType === "member"
                                        ? "報名費(學會會員)"
                                        : "報名費(非學會會員)",
                                amount: payment.paymentValue,
                            },
                            {
                                to: user.contact_email,
                                subject: "2025農機與生機學術研討會-繳費成功通知",
                            }
                        );
                        console.log(
                            `User ${payment.paymentOwner} has been informed about the payment status change.`
                        );
                    }
                }
            } catch (dbError) {
                console.error("更新數據庫失敗:", dbError);
                // 繼續執行，不中斷響應
            }
        }

        // 返回查詢結果（加上支付狀態）
        return NextResponse.json({
            success: true,
            order: {
                ...responseData,
                paymentStatus: paymentStatus.status,
                isPaid: paymentStatus.isPaid,
            },
        });
    } catch (error) {
        console.error("查詢訂單失敗:", error);
        return NextResponse.json(
            { success: false, error: "查詢訂單失敗", details: error.message },
            { status: 500 }
        );
    }
};

export const GET = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);
