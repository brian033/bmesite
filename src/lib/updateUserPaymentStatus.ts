import clientPromise from "./mongodb";
import { getCheckMac } from "@/app/api/payment/create-order/route";
import { Payment } from "@/types/payment";

const MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "3002607";
const ECPAY_QUERY_API_URL =
    process.env.ECPAY_QUERY_API_URL ||
    "https://payment-stage.ecpay.com.tw/Cashier/QueryTradeInfo/V5";

/**
 * 查詢綠界的訂單狀態
 * @param merchantTradeNo 商家交易編號
 * @returns 查詢結果
 */
async function queryECPayOrderStatus(merchantTradeNo: string): Promise<Record<string, string>> {
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

    // 發送請求到綠界
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
    const responseData: Record<string, string> = {};
    responseText
        .split("&")
        .filter(Boolean)
        .forEach((pair) => {
            const parts = pair.split("=");
            if (parts.length === 2) {
                const key = decodeURIComponent(parts[0]);
                const value = decodeURIComponent(parts[1]);
                if (key) {
                    responseData[key] = value;
                }
            }
        });

    return responseData;
}

/**
 * 更新用戶的支付狀態
 * @param uuid 用戶UUID
 * @returns 更新結果的概要
 */
export async function updateUserPaymentStatus(uuid: string): Promise<{
    success: boolean;
    message: string;
    updatedPayments: Array<{
        paymentId: string;
        oldStatus: string;
        newStatus: string;
        isPaid: boolean;
    }>;
}> {
    try {
        // 連接到 MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection("users");
        const paymentsCollection = db.collection("payments");

        // 查找用戶
        const user = await usersCollection.findOne({ uuid });
        if (!user) {
            return {
                success: false,
                message: `找不到UUID為 ${uuid} 的用戶`,
                updatedPayments: [],
            };
        }

        // 檢查用戶是否有支付資料
        if (
            !user.payment ||
            !Array.isArray(user.payment.payment_id) ||
            user.payment.payment_id.length === 0
        ) {
            return {
                success: true,
                message: `用戶 ${uuid} 沒有任何支付記錄`,
                updatedPayments: [],
            };
        }
        // 檢查用戶的支付狀態
        if (user.payment.paid) {
            return {
                success: true,
                message: `用戶 ${uuid} 的支付狀態已經是paid`,
                updatedPayments: [],
            };
        }

        // 更新狀態的結果記錄
        const updatedPayments: Array<{
            paymentId: string;
            oldStatus: string;
            newStatus: string;
            isPaid: boolean;
        }> = [];

        // 處理用戶的每個支付ID
        for (const paymentId of user.payment.payment_id) {
            // 查找支付記錄
            const payment = (await paymentsCollection.findOne({ paymentId })) as Payment | null;

            // 如果找不到支付記錄，跳過
            if (!payment) {
                console.warn(`找不到ID為 ${paymentId} 的支付記錄`);
                continue;
            }

            // 如果支付狀態已經是paid或failed，則跳過
            if (payment.paymentStatus !== "created") {
                continue;
            }

            // 查詢綠界的訂單狀態
            try {
                const ecpayResponse = await queryECPayOrderStatus(paymentId);
                const tradeStatus = ecpayResponse.TradeStatus;

                let newStatus: "created" | "paid" | "failed" = payment.paymentStatus;
                let isPaid = false;

                // 根據tradeStatus更新支付狀態
                if (tradeStatus === "1") {
                    // 已付款
                    newStatus = "paid";
                    isPaid = true;
                } else if (tradeStatus === "10200095") {
                    // 交易失敗
                    newStatus = "failed";
                } else {
                    // 其他狀態 (包括 "0")，保持為created
                    newStatus = "created";
                }

                // 只有狀態有變化時才更新
                if (newStatus !== payment.paymentStatus) {
                    // 更新支付記錄
                    await paymentsCollection.updateOne(
                        { paymentId },
                        {
                            $set: {
                                paymentStatus: newStatus,
                                updatedAt: new Date(),
                                ecpayResponse: ecpayResponse,
                            },
                        }
                    );

                    // 記錄更新結果
                    updatedPayments.push({
                        paymentId,
                        oldStatus: payment.paymentStatus,
                        newStatus,
                        isPaid,
                    });

                    // 只有當新狀態是 "paid" 時，才更新用戶的付款狀態
                    if (newStatus === "paid") {
                        await usersCollection.updateOne(
                            { uuid },
                            { $set: { "payment.paid": true } }
                        );
                    }
                }
            } catch (error) {
                console.error(`查詢支付ID ${paymentId} 狀態時出錯:`, error);
            }
        }

        return {
            success: true,
            message: `用戶 ${uuid} 的支付狀態已更新，有 ${updatedPayments.length} 筆記錄變更`,
            updatedPayments,
        };
    } catch (error) {
        console.error(`更新用戶 ${uuid} 的支付狀態時出錯:`, error);
        return {
            success: false,
            message: `處理時發生錯誤: ${error.message}`,
            updatedPayments: [],
        };
    }
}

/**
 * 批量更新所有用戶的支付狀態
 * @returns 更新結果的概要
 */
export async function updateAllUsersPaymentStatus(): Promise<{
    success: boolean;
    message: string;
    processedUsers: number;
    updatedPayments: number;
}> {
    try {
        // 連接到 MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection("users");

        // 查找所有有payment_id的用戶
        const users = await usersCollection
            .find({ "payment.payment_id": { $exists: true, $ne: [] } })
            .toArray();

        let totalUpdated = 0;
        let processedUsers = 0;

        // 依序更新每個用戶的支付狀態
        for (const user of users) {
            processedUsers++;
            try {
                const result = await updateUserPaymentStatus(user.uuid);
                totalUpdated += result.updatedPayments.length;
            } catch (error) {
                console.error(`處理用戶 ${user.uuid} 時出錯:`, error);
            }
        }

        return {
            success: true,
            message: `已處理 ${processedUsers} 個用戶，更新了 ${totalUpdated} 筆支付記錄`,
            processedUsers,
            updatedPayments: totalUpdated,
        };
    } catch (error) {
        console.error(`批量更新用戶支付狀態時出錯:`, error);
        return {
            success: false,
            message: `處理時發生錯誤: ${error.message}`,
            processedUsers: 0,
            updatedPayments: 0,
        };
    }
}
