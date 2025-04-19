// src/app/api/documents/[pdfId]/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ✅ GET handler：取得文件資訊
const getHandler = async (req: NextRequest, session: any, pdfId: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const doc = await db.collection("documents").findOne({ documentId: pdfId });

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        const isAdmin = session.user.role === "admin";
        const isOwner = session.user.uuid === doc.documentOwner;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(doc, { status: 200 });
    } catch (err) {
        console.error("Error fetching document:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// ✅ POST handler：送出審稿申請
const postHandler = async (req: NextRequest, session: any, pdfId: string) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection("documents");

        const doc = await collection.findOne({ documentId: pdfId });

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (doc.documentOwner !== session.user.uuid) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (doc.documentStatus !== "uploaded") {
            return NextResponse.json(
                {
                    error: `Only uploaded documents can be submitted. Current status: ${doc.documentStatus}`,
                },
                { status: 400 }
            );
        }

        await collection.updateOne({ documentId: pdfId }, { $set: { documentStatus: "pending" } });

        return NextResponse.json({ success: true, newStatus: "pending" });
    } catch (err) {
        console.error("Submit error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

// ✅ 包裝 GET route
export async function GET(req: NextRequest, ctx: { params: Promise<{ pdfId: string }> }) {
    const { pdfId } = await ctx.params;

    return middlewareFactory({ cors: true, auth: true }, (req, session) =>
        getHandler(req, session, pdfId)
    )(req);
}

// ✅ 包裝 POST route
export async function POST(req: NextRequest, ctx: { params: Promise<{ pdfId: string }> }) {
    const { pdfId } = await ctx.params;

    return middlewareFactory({ cors: true, auth: true }, (req, session) =>
        postHandler(req, session, pdfId)
    )(req);
}

// ✅ 預檢 CORS request
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
