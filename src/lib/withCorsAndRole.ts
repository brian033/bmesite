// lib/withCorsAndRole.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// 支援傳入角色陣列 + 原始 handler function
export function withCorsAndRole(
    roles: string[] = [],
    handler: (req: NextRequest, session: any) => Promise<Response>
) {
    return async function (req: NextRequest) {
        const origin = req.headers.get("origin") || "";

        const allowedOrigins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:34567",
            "https://conftest.brian033.dev",
            "https://beame2025.cc/",
        ];

        const allowOrigin = allowedOrigins.includes(origin) ? origin : "";

        // 處理 CORS 預檢請求
        if (req.method === "OPTIONS") {
            return new Response(null, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": allowOrigin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Credentials": "true",
                },
            });
        }

        // 抓 session
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.role) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: {
                    "Access-Control-Allow-Origin": allowOrigin,
                    "Access-Control-Allow-Credentials": "true",
                },
            });
        }

        if (roles.length > 0 && !roles.includes(session.user.role)) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: {
                    "Access-Control-Allow-Origin": allowOrigin,
                    "Access-Control-Allow-Credentials": "true",
                },
            });
        }

        // 執行實際 handler
        const res = await handler(req, session);
        res.headers.set("Access-Control-Allow-Origin", allowOrigin);
        res.headers.set("Access-Control-Allow-Credentials", "true");

        return res;
    };
}
