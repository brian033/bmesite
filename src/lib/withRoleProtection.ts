// lib/withRoleProtection.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export async function withRoleProtection(requiredRoles: string[]) {
    const session = await getServerSession(authOptions);

    if (!session || !requiredRoles.includes(session.user.role)) {
        redirect("/"); // 或顯示錯誤頁面
    }

    return session;
}
