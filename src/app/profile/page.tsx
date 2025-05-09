// app/profile/page.tsx

import { getTypedSession } from "@/lib/getTypedSession";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { updateUserPaymentStatus } from "@/lib/updateUserPaymentStatus";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentStatusCard from "./components/PaymentStatusCard";

export default async function AttendeePage() {
    const session = await getTypedSession();

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
    }

    // 更新用戶的支付狀態
    let paymentUpdateResult = null;
    if (session.user.uuid) {
        try {
            paymentUpdateResult = await updateUserPaymentStatus(session.user.uuid);
            console.log("支付狀態更新結果:", paymentUpdateResult);
        } catch (error) {
            console.error("更新支付狀態時出錯:", error);
        }
    }

    if (!session.user.registered) {
        return (
            <div style={{ padding: "2rem" }}>
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>提醒</AlertTitle>
                    <AlertDescription>
                        請填寫聯絡用 Email 與單位後，才能使用完整功能。
                    </AlertDescription>
                </Alert>
                <h1>個人資料設定</h1>
                <ProfileCard />
            </div>
        );
    }

    // 檢查是否有支付狀態更新
    const hasPaymentUpdates =
        paymentUpdateResult &&
        paymentUpdateResult.success &&
        paymentUpdateResult.updatedPayments.length > 0;

    return (
        <div className="mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-semibold text-gray-800">個人資料設定</h1>

            {/* 顯示支付更新通知 */}
            {hasPaymentUpdates && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">支付狀態已更新</AlertTitle>
                    <AlertDescription className="text-green-700">
                        您的付款記錄已成功更新，請重新整理頁面。
                        {paymentUpdateResult.updatedPayments.map(
                            (update, idx) =>
                                update.isPaid && (
                                    <Badge key={idx} className="ml-2 bg-green-500">
                                        付款成功
                                    </Badge>
                                )
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* 個人資料區塊 */}
            <Card>
                <CardContent>
                    <ProfileCard />
                </CardContent>
            </Card>
            {/* 註冊費用狀態區塊 */}
            <PaymentStatusCard session={session} paid={hasPaymentUpdates} />

            <h1 className="text-3xl font-semibold text-gray-800">文件管理</h1>
            {/* 文件管理區塊 */}
            <Card>
                <CardContent>
                    <DocumentManager session={session} />
                </CardContent>
            </Card>
        </div>
    );
}
