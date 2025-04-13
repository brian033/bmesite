// lib/middlewareFactory.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

interface MiddlewareOptions {
    cors?: boolean;
    auth?: boolean;
    role?: string[];
    originWhitelist?: string[];
}

export function middlewareFactory(
    options: MiddlewareOptions,
    handler: (req: NextRequest, session: any | null) => Promise<Response>
) {
    return async function (req: NextRequest) {
        const origin = req.headers.get("origin") || "";
        const allowedOrigins = options.originWhitelist || [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:34567",
            "https://conftest.brian033.dev",
        ];

        const allowOrigin = allowedOrigins.includes(origin) ? origin : "";

        // Handle preflight CORS
        if (options.cors && req.method === "OPTIONS") {
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

        let session: any | null = null;
        if (options.auth || options.role) {
            session = await getServerSession(authOptions);
            if (!session || !session.user?.email) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    {
                        status: 401,
                        headers: options.cors
                            ? {
                                  "Access-Control-Allow-Origin": allowOrigin,
                                  "Access-Control-Allow-Credentials": "true",
                              }
                            : {},
                    }
                );
            }

            if (options.role && session.user.role && !options.role.includes(session.user.role)) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    {
                        status: 403,
                        headers: options.cors
                            ? {
                                  "Access-Control-Allow-Origin": allowOrigin,
                                  "Access-Control-Allow-Credentials": "true",
                              }
                            : {},
                    }
                );
            }
        }

        const res = await handler(req, session);
        if (options.cors) {
            res.headers.set("Access-Control-Allow-Origin", allowOrigin);
            res.headers.set("Access-Control-Allow-Credentials", "true");
        }
        return res;
    };
}
