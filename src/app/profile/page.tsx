// app/profile/page.tsx

import { getTypedSession } from "@/lib/getTypedSession";
import { redirect } from "next/navigation";
import { updateUserPaymentStatus } from "@/lib/updateUserPaymentStatus";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";
import PaymentStatusCard from "./components/PaymentStatusCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 使頁面接收查詢參數
export default async function AttendeePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const session = await getTypedSession();

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
    }

    // 檢查是否有請求更新支付狀態
    const shouldUpdate = searchParams.update === "true";

    // 更新用戶的支付狀態 (僅當 update=true 時)
    let paymentUpdateResult = null;
    if (shouldUpdate && session.user.uuid) {
        try {
            paymentUpdateResult = await updateUserPaymentStatus(session.user.uuid);
            console.log("支付狀態更新結果:", paymentUpdateResult);
        } catch (error) {
            console.error("更新支付狀態時出錯:", error);
        }
    }

    // 未完成註冊的用戶顯示簡化界面
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

    // 檢查用戶是否有待處理的支付（已創建訂單但未付款完成）
    const hasPendingPayment =
        !session.user.payment?.paid &&
        session.user.payment?.payment_id &&
        session.user.payment.payment_id.length > 0;

    return (
        <div className="mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-semibold text-gray-800">個人資料設定</h1>

            {/* 顯示支付更新通知 */}
            {hasPaymentUpdates && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">支付狀態已更新</AlertTitle>
                    <AlertDescription className="text-green-700">
                        您的付款記錄已成功更新。
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
                <CardContent className="pt-6">
                    <ProfileCard />
                </CardContent>
            </Card>

            {/* 註冊費用狀態區塊 */}
            <h1 className="text-3xl font-semibold text-gray-800">支付狀態</h1>
            <div className="relative">
                <PaymentStatusCard session={session} paid={session.user.payment?.paid} />

                {/* 當用戶有待處理的支付時顯示刷新按鈕 */}
                {hasPendingPayment && (
                    <div className="mt-4 flex justify-center">
                        <Link href="/profile?update=true">
                            <Button
                                size="lg"
                                variant="link"
                                className="flex min-width-100% items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                <RefreshCcw className="h-5 w-5" />
                                我已經付款
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <h1 className="text-3xl font-semibold text-gray-800">文件管理</h1>
            {/* 文件管理區塊 */}
            <Card>
                <CardContent className="pt-6">
                    <DocumentManager session={session} />
                </CardContent>
            </Card>
        </div>
    );
}
