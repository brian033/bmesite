// app/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import ProfileCard from "./components/ProfileCard";
import DocumentManager from "./components/DocumentManager";

export default async function AttendeePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/"); // 🔥 server-side redirect to homepage
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>個人資料設定</h1>
            <ProfileCard />
            <DocumentManager />
        </div>
    );
}
