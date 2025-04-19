// src/app/api/attendee/remove_document/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, session: any) => {
    const { pdfId, pdftype } = await req.json();

    if (!pdfId || !pdftype) {
        return NextResponse.json({ error: "Missing pdfId or pdftype" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const doc = await db.collection("documents").findOne({ documentId: pdfId });

    if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.documentOwner !== session.user.uuid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (doc.documentStatus !== "uploaded") {
        return NextResponse.json(
            { error: "Only uploaded documents can be removed" },
            { status: 400 }
        );
    }

    const result = await db.collection("users").updateOne(
        { email: session.user.email },
        {
            $pull: {
                [`uploaded_pdfs.${pdftype}`]: { pdfId: pdfId },
            },
        }
    );

    if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to untrack document" }, { status: 400 });
    }

    return NextResponse.json({ success: true, untracked: pdfId });
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
