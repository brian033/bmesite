// lib/withCorsAndSession.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export function withCorsAndSession(handler: (req: NextRequest, session: any) => Promise<Response>) {
    return async function (req: NextRequest) {
        const origin = req.headers.get("origin") || "";

        const allowedOrigins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:34567",
            "https://conftest.brian033.dev",
        ];

        const allowOrigin = allowedOrigins.includes(origin) ? origin : "";

        // CORS preflight
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

        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                {
                    status: 401,
                    headers: {
                        "Access-Control-Allow-Origin": allowOrigin,
                        "Access-Control-Allow-Credentials": "true",
                    },
                }
            );
        }

        const res = await handler(req, session);
        res.headers.set("Access-Control-Allow-Origin", allowOrigin);
        res.headers.set("Access-Control-Allow-Credentials", "true");

        return res;
    };
}
