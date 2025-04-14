// src/app/api/admin/set-role/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, session: any) => {
    const body = await req.json();
    const { email, newRole } = body;

    if (!email || !newRole) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const allowedRoles = ["admin", "attendee", "reviewer"];
    if (!allowedRoles.includes(newRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.collection("users").updateOne({ email }, { $set: { role: newRole } });

    if (result.modifiedCount === 1) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
};

// ✅ 改用 middlewareFactory，套用 CORS + 身份驗證 + 角色驗證
export const POST = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);

// ✅ 加 OPTIONS 讓瀏覽器 CORS preflight 不會爆
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
