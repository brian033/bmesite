// app/profile/page.tsx

import { getTypedSession } from "@/lib/getTypedSession";
import { redirect } from "next/navigation";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";
import PaymentStatusCard from "./components/PaymentStatusCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
