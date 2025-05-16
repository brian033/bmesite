"use client";

import { Session } from "next-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentButton from "@/app/components/PaymentButton";

type PaymentStatusCardProps = {
    session: Session;
};

export default function PaymentStatusCard({ session }: PaymentStatusCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="p-4">
                    <h1 className="text-lg font-bold mb-4 text-center">
                        您尚未繳交會議參加費用，可以投稿進行審核，不過需要繳費後才可以在現場發表海報/口頭報告，繳費後會優先審稿。
                    </h1>
                    <div className="flex flex-row flex-wrap space-x-4">
                        <div className="bg-white m-3 p-4 rounded-lg shadow-md flex-1">
                            <h2 className="text-md font-semibold mb-2">學會會員</h2>
                            <p className="text-gray-600 mb-4 text-sm">
                                若您為學會會員，請使用此按鈕付費。
                            </p>
                            <div className="flex justify-between flex-row flex-wrap items-end">
                                <div className="text-xl font-bold">NT$5,000</div>
                                <PaymentButton
                                    paymentType="member"
                                    onSuccess={(data) => {
                                        console.log("付款已開始處理", data);
                                        // 可以在這裡加入成功提示，或重定向用戶
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-white m-3 p-4 rounded-lg shadow-md flex-1">
                            <h2 className="text-md font-semibold mb-2">一般參加者</h2>
                            <p className="text-gray-600 mb-4 text-sm">
                                若您為學會會員，請使用此按鈕付費。
                            </p>
                            <div className="flex justify-between flex-row flex-wrap items-end">
                                <div className="text-xl font-bold">NT$10,000</div>
                                <PaymentButton
                                    paymentType="non-member"
                                    variant="outline"
                                    onSuccess={(data) => {
                                        console.log("付款已開始處理", data);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
