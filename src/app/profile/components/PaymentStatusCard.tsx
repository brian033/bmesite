"use client";

import { Session } from "next-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentButton from "@/app/components/PaymentButton";
import { useEffect, useState } from "react";
import { PaymentOption } from "@/types/paymentOption";

type PaymentStatusCardProps = {
    session: Session;
};

export default function PaymentStatusCard({ session }: PaymentStatusCardProps) {
    const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 從 API 獲取付款選項
    useEffect(() => {
        const fetchPaymentOptions = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/payment/paymentOptions");
                const data = await response.json();

                if (data.success) {
                    // 根據 displayOrder 排序選項
                    const sortedOptions = data.availableOptions.sort(
                        (a: PaymentOption, b: PaymentOption) => a.displayOrder - b.displayOrder
                    );
                    setPaymentOptions(sortedOptions);
                } else {
                    setError(data.message || "無法獲取付款選項");
                }
            } catch (err) {
                console.error("獲取付款選項錯誤", err);
                setError("無法連接到服務器");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentOptions();
    }, []);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="p-4">
                    <h1 className="text-lg font-bold mb-4 text-center">
                        您尚未繳交會議參加費用，可以投稿進行審核，不過需要繳費後才可以在現場發表海報/口頭報告，繳費後會優先審稿。
                        <br />
                        You can start submitting abstracts, but you need to pay the fee to present
                        your poster/oral presentation on-site if it got accepted.
                    </h1>

                    {/*loading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2">載入付款選項中...</p>
                        </div>
                    )*/}

                    {/*error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            <p>{error}</p>
                            <button
                                className="text-sm underline mt-2"
                                onClick={() => window.location.reload()}
                            >
                                重新載入
                            </button>
                        </div>
                    )*/}

                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                        目前沒有可用的付款選項。請等待繳款功能開放。There are currently no available payment options. Please wait for the payment feature to become available.
                    </div>

                    <div className="flex flex-row flex-wrap space-x-4">
                        {/*paymentOptions.map((option) => (
                            <div
                                key={option.paymentOptionId}
                                className="bg-white m-3 p-4 rounded-lg shadow-md flex-1"
                            >
                                <h2 className="text-md font-semibold mb-2">{option.displayName}</h2>
                                <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                                <div className="flex justify-between flex-row flex-wrap items-end">
                                    <div className="text-xl font-bold">
                                        NT${option.price.toLocaleString()}
                                    </div>
                                    <PaymentButton
                                        paymentOptionId={option.paymentOptionId} // 使用 paymentOptionId 而不是 paymentType
                                        buttonText={`NT$${option.price.toLocaleString()}`} // 動態生成按鈕文字
                                        variant={"default"}
                                        onSuccess={(data) => {
                                            console.log(`${option.name} 付款已開始處理`, data);
                                            // 可以在這裡加入成功提示，或重定向用戶
                                        }}
                                    />
                                </div>
                            </div>
                        ))*/}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
