"use client";

import { Session } from "next-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentButton from "@/app/components/PaymentButton";

type PaymentStatusCardProps = {
    session: Session;
    paid: boolean;
};

export default function PaymentStatusCard({ session, paid }: PaymentStatusCardProps) {
    const isPaid = session?.user?.payment?.paid || paid;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">註冊費用狀態</span>
                        {isPaid ? (
                            <Badge className="bg-green-500">已付款</Badge>
                        ) : (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                未付款
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        {isPaid
                            ? "您已完成註冊費用的支付，可以使用所有功能。"
                            : "您尚未完成註冊費用的支付，請進行付款以使用完整功能。"}
                    </div>
                    {!isPaid && (
                        <div className="p-4">
                            <h1 className="text-lg font-bold mb-4">會議註冊</h1>

                            <div className="flex flex-row space-x-4">
                                <div className="bg-white p-4 rounded-lg shadow-md flex-1">
                                    <h2 className="text-md font-semibold mb-2">學會會員</h2>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        適合生機農機人學會的會員參加者。請準備好您的會員資料進行驗證。
                                    </p>
                                    <div className="flex justify-between items-end">
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

                                <div className="bg-white p-4 rounded-lg shadow-md flex-1">
                                    <h2 className="text-md font-semibold mb-2">一般參加者</h2>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        適合非學會會員的一般參加者。包含會議資料、茶點及午餐。
                                    </p>
                                    <div className="flex justify-between items-end">
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
