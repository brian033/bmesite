// app/profile/page.tsx

import { getTypedSession } from "@/lib/getTypedSession";
import { redirect } from "next/navigation";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";
import PaymentStatusCard from "./components/PaymentStatusCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// 使頁面接收查詢參數
export default async function AttendeePage() {
    const session = await getTypedSession();

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
    }

    // 未完成註冊的用戶顯示簡化界面
    if (!session.user.registered) {
        return (
            <div style={{ padding: "2rem" }}>
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 font-medium">提醒</AlertTitle>
                    <AlertDescription className="text-green-700">
                        請填寫聯絡用 Email, 單位,
                        飲食偏好,晚宴參加意願和隱私權聲明後，才能繳費和上傳審稿案件。
                        <br />
                        To proceed with payment and submit your review assignment, please complete
                        the required fields: contact email, affiliation, dietary preferences, dinner
                        attendance, and acknowledgment of the privacy policy.
                    </AlertDescription>
                </Alert>
                <h1>個人資料設定 Profile settings</h1>
                <ProfileCard />
            </div>
        );
    }

    return (
        <div className="mx-auto p-6 space-y-8">
            {/* 個人資料區塊 */}

            <ProfileCard />

            {/* 註冊費用狀態區塊 */}
            {!session.user.payment?.paid && (
                <div className="relative">
                    <PaymentStatusCard session={session} />
                </div>
            )}

            {/* 文件管理區塊 */}
            <DocumentManager session={session} />
        </div>
    );
}
