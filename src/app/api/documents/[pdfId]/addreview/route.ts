import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
const postHandler = async (req: NextRequest, session: any, pdfId: string) => {
    const body = await req.json();
    const { approved, note } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("documents");

    const doc = await collection.findOne({ documentId: pdfId });

    if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const reviewer = session.user.name;
    const reviewerEmail = session.user.email;
    const isAdmin = session.user.role === "admin";
    const isReviewer = session.user.role === "reviewer";

    if (!isAdmin && !isReviewer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingReviewIndex = doc.reviewedBy.findIndex(
        (entry: any) => entry.reviewerEmail === reviewerEmail
    );

    const reviewEntry = {
        reviewer,
        reviewerEmail,
        approved,
        note,
        reviewedAt: new Date().toISOString(),
    };

    if (existingReviewIndex === -1) {
        // 還沒審過，直接 push
        await collection.updateOne(
            { documentId: pdfId },
            {
                $push: {
                    reviewedBy: reviewEntry,
                },
            }
        );
    } else {
        // 已經有審過，更新那一筆
        const updateField = `reviewedBy.${existingReviewIndex}`;
        await collection.updateOne(
            { documentId: pdfId },
            {
                $set: {
                    [updateField]: reviewEntry,
                },
            }
        );
    }

    return NextResponse.json({ success: true, review: reviewEntry });
};

export function POST(req: NextRequest, ctx: { params: { pdfId: string } }) {
    return middlewareFactory(
        { cors: true, auth: true, role: ["admin", "reviewer"] },
        (req, session) => postHandler(req, session, ctx.params.pdfId)
    )(req);
}

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
