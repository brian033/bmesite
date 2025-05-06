import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { note } from "@/types/document";
const postHandler = async (req: NextRequest, session: any, pdfId: string) => {
    const body = await req.json();
    const note = body.note;

    if (!note) {
        return NextResponse.json({ error: "Note is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("documents").findOne({ documentId: pdfId });

    if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = session.user.uuid === doc.documentOwner;
    const isAdmin = session.user.role === "admin";
    const isReviewer = session.user.role === "reviewer";

    if (!isOwner && !isAdmin && !isReviewer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newNote: note = {
        note: note,
        createdAt: new Date().toISOString(),
        noteCreatorId: session.user.uuid,
        noteCreatorName: session.user.name,
    };

    await db
        .collection("documents")
        .updateOne({ documentId: pdfId }, { $push: { notes: newNote } });

    return NextResponse.json({ success: true, newNote: newNote });
};

export async function POST(req: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
    const { pdfId } = await ctx.params;

    return middlewareFactory({ cors: true, auth: true }, (req, session) =>
        postHandler(req, session, pdfId)
    )(req);
}

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
