// 管理審稿白名單 API
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

interface WhitelistSettings {
    oral: boolean;
    poster: boolean;
    undecided: boolean;
}

const handler = async (req: NextRequest, session: any) => {
    // 確保只有管理員可以使用此功能
    if (session.user.role !== "admin") {
        return NextResponse.json({ error: "只有管理員可以設定審稿白名單" }, { status: 403 });
    }

    const body = await req.json();
    const { email, whitelist } = body;

    if (!email || !whitelist) {
        return NextResponse.json({ error: "缺少必要資料" }, { status: 400 });
    }

    // 驗證白名單格式
    if (
        typeof whitelist !== "object" ||
        typeof whitelist.oral !== "boolean" ||
        typeof whitelist.poster !== "boolean" ||
        typeof whitelist.undecided !== "boolean"
    ) {
        return NextResponse.json({ error: "白名單格式不正確" }, { status: 400 });
    }

    // 轉換為陣列格式 (["oral", "poster", "undecided"])
    const reviewingWhitelist = Object.entries(whitelist)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key);

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 更新用戶的 reviewing_whitelist 屬性
        const result = await db
            .collection("users")
            .updateOne({ email }, { $set: { reviewing_whitelist: reviewingWhitelist } });

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "找不到指定用戶" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "已成功更新審稿白名單設定",
            whitelist: reviewingWhitelist,
        });
    } catch (error) {
        console.error("更新審稿白名單時發生錯誤:", error);
        return NextResponse.json({ error: "更新失敗: " + error.message }, { status: 500 });
    }
};

// ✅ 使用 middlewareFactory，套用 CORS + 身份驗證 + 角色驗證
export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);

// ✅ 加 OPTIONS 讓瀏覽器 CORS preflight 不會爆
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
