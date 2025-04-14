// // ✅ src/app/api/user_uploads/[...path]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
// import path from "path";
// import fs from "fs/promises";
// import { existsSync } from "fs";

// export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user?.uuid) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const requestedPath = path.join(...params.path);

//     const filePath = path.join(process.cwd(), "uploads", session.user.uuid, requestedPath);

//     if (!existsSync(filePath)) {
//         return NextResponse.json({ error: "File not found" }, { status: 404 });
//     }

//     const fileBuffer = await fs.readFile(filePath);
//     const ext = path.extname(filePath).slice(1);
//     const contentType = getMimeType(ext);

//     return new NextResponse(fileBuffer, {
//         status: 200,
//         headers: {
//             "Content-Type": contentType,
//             "Content-Disposition": `inline; filename=\"${params.path.at(-1)}\"`,
//         },
//     });
// }

// function getMimeType(ext: string): string {
//     const map: Record<string, string> = {
//         jpg: "image/jpeg",
//         jpeg: "image/jpeg",
//         png: "image/png",
//         gif: "image/gif",
//         pdf: "application/pdf",
//         txt: "text/plain",
//         zip: "application/zip",
//         svg: "image/svg+xml",
//         webp: "image/webp",
//     };
//     return map[ext.toLowerCase()] || "application/octet-stream";
// }

// src/app/api/user_uploads/[...path]/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

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

const handler = async (req: NextRequest, session: any, pathParts: string[]) => {
    const requestedPath = path.join(...pathParts);

    const filePath = path.join(process.cwd(), "uploads", session.user.uuid, requestedPath);

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
            "Content-Disposition": `inline; filename=\"${pathParts.at(-1)}\"`,
        },
    });
};

// ✅ 包裝 GET route，從 ctx 拿 params 傳進 handler
// export function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
//     return middlewareFactory({ cors: true, auth: true }, (req, session) =>
//         handler(req, session, ctx.params.path)
//     )(req);
// }
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;

    return middlewareFactory({ cors: true, auth: true }, (req, session) =>
        handler(req, session, path)
    )(req);
}

// ✅ 加 CORS 預檢
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
