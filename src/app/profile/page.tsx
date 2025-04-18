// app/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";

export default async function AttendeePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
    }
    if (!session.user.registered) {
        return (
            <div style={{ padding: "2rem" }}>
                <h1>個人資料設定</h1>
                <p>請先完成資料填寫，才能使用個人資料設定功能，輸入後請重整頁面。</p>
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
