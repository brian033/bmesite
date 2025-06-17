import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCheckMac } from "../create-order/route";
import { sendTemplateEmail } from "@/lib/mailTools";

/**
 * 處理綠界支付結果通知的API路由
 *
 * 這個API接收來自綠界的付款結果通知，並更新訂單狀態
 * 綠界會在用戶完成付款後，向這個API發送POST請求
 */
const handler = async (req: NextRequest) => {
    try {
        // 解析請求內容(綠界使用 form-data 格式)
        const formData = await req.formData();
        const data: Record<string, any> = {};

        // 將FormData轉換為對象
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // 將formData直接存入db，紀錄這個api endpoint收到的所有requests
        // 這樣可以用來debug
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        await db.collection("payment_notifications").insertOne(data);

        console.log("接收到綠界支付通知:", data);

        // 驗證必要的參數是否存在
        const requiredFields = ["MerchantID", "MerchantTradeNo", "RtnCode", "CheckMacValue"];
        for (const field of requiredFields) {
            if (!data[field]) {
                console.error(`缺少必要參數: ${field}`);
                return NextResponse.json(
                    { success: false, message: `缺少必要參數: ${field}` },
                    { status: 400 }
                );
            }
        }

        // 使用 getCheckMac 函數計算應該的 CheckMacValue, 要先把_id丟掉
        const { _id, ...dataWithoutId } = data;
        const calculatedCheckMac = getCheckMac(dataWithoutId);

        // 比較接收到的和計算出的 CheckMacValue
        if (data.CheckMacValue !== calculatedCheckMac) {
            console.error(
                `CheckMacValue 驗證失敗，接收: ${data.CheckMacValue}, 計算: ${calculatedCheckMac}`
            );
            return NextResponse.json(
                { success: false, message: "CheckMacValue 驗證失敗" },
                { status: 400 }
            );
        }

        console.log("CheckMacValue 驗證成功");

        // 查找對應的付款記錄
        const payment = await db.collection("payments").findOne({
            paymentId: data.MerchantTradeNo,
        });

        if (!payment) {
            console.error(`找不到訂單記錄: ${data.MerchantTradeNo}`);
            return NextResponse.json(
                { success: false, message: "找不到訂單記錄" },
                { status: 400 }
            );
        }

        const isPaid = data.RtnCode === "1"; // RtnCode為1表示付款成功
        if (isPaid) {
            // 更新付款記錄狀態
            await db.collection("payments").updateOne(
                { paymentId: data.MerchantTradeNo },
                {
                    $set: {
                        paymentStatus: "paid",
                        paymentResponse: data,
                        updatedAt: new Date().toISOString(),
                        ecpayResponse: dataWithoutId,
                    },
                }
            );
            const userId = payment.paymentOwner;

            // 更新用戶的付款狀態
            const updateResult = await db.collection("users").updateOne(
                { uuid: userId },
                {
                    $set: {
                        "payment.paid": true,
                    },
                }
            );

            // 如果用戶的付款狀態從未付款變為已付款，則發送通知郵件
            if (updateResult.modifiedCount === 1) {
                const user = await db.collection("users").findOne({ uuid: userId });
                const payment = await db
                    .collection("payments")
                    .findOne({ paymentId: data.MerchantTradeNo });

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
                        subject: "2025生機與農機學術研討會-繳費成功通知",
                    }
                );
                console.log(
                    `User ${payment.paymentOwner} has been informed about the payment status change.`
                );
            }
        }

        // 根據綠界規範，回覆 "1|OK" 表示成功接收通知
        return new NextResponse("1|OK", {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error("處理綠界支付通知時出錯:", error);

        // 即使出錯，也返回成功以避免綠界重複發送通知
        // 但在日誌中記錄錯誤以便後續排查
        return new NextResponse("1|OK", {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }
};

export const POST = handler;
