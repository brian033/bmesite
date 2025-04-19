// app/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function AttendeePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
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

    return (
        <div style={{ padding: "2rem" }}>
            <h1>個人資料設定</h1>
            <ProfileCard />
            <DocumentManager />
        </div>
    );
}
