// src/app/api/admin/user_uploads/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

// 取得 MIME 類型
const getMimeType = (ext: string): string => {
    const map: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        pdf: "application/pdf",
        txt: "text/plain",
        zip: "application/zip",
        svg: "image/svg+xml",
        webp: "image/webp",
    };
    return map[ext.toLowerCase()] || "application/octet-stream";
};

// 核心處理邏輯
const handler = async (req: NextRequest, session: any, slug: string[]): Promise<NextResponse> => {
    if (!slug || slug.length < 2) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const uuid = slug[0];
    const pathParts = slug.slice(1);
    const requestedPath = path.join(...pathParts);
    const filePath = path.join(process.cwd(), "uploads", uuid, requestedPath);

    if (!existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    const contentType = getMimeType(ext);

    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${pathParts.at(-1)}"`,
        },
    });
};

// GET 方法：包 middlewareFactory（含角色驗證）
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    // 取得 slug 參數
    const { slug } = await params;
    return middlewareFactory(
        { cors: true, auth: true, role: ["admin", "reviewer"] },
        (req, session) => handler(req, session, params.slug)
    )(req);
}

// CORS 預檢
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
