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
    await recordSubmissionReview(db, pdfId, reviewer, reviewerEmail, approved, note);
    return NextResponse.json({ success: true, review: reviewEntry });
};
// ✅ Side Effect: Update review info in submission
const recordSubmissionReview = async (
    db: any,
    pdfId: string,
    reviewer: string,
    reviewerEmail: string,
    approved: boolean,
    note: string
) => {
    const submissionDB = db.collection("submissions");

    // 找出包含這個 pdfId 的 submission（submissionFiles 陣列中包含該 ID）
    const submission = await submissionDB.findOne({ submissionFiles: pdfId });
    if (!submission) return;

    // 找出該文件在 submissionFiles 中的 index
    const fileIndex = submission.submissionFiles.indexOf(pdfId);
    if (fileIndex === -1) return;

    const reviewRecord = {
        index: fileIndex,
        reviewer,
        opinion: approved ? "approved" : "rejected",
        comment: note,
        reviewerEmail,
        reviewedAt: new Date().toISOString(),
    };

    await submissionDB.updateOne(
        { submissionId: submission.submissionId },
        {
            // 先移除舊紀錄
            $pull: {
                submissionReviewedBy: {
                    reviewerEmail,
                    index: fileIndex,
                },
            },
        }
    );

    // 再 push 兩筆
    await submissionDB.updateOne(
        { submissionId: submission.submissionId },
        {
            $push: {
                submissionReviewedBy: reviewRecord,
            },
            $set: {
                submissionReviewedAt: new Date().toISOString(),
            },
        },
        { upsert: false }
    );
};

export async function POST(req: NextRequest, context: { params: Promise<{ pdfId: string }> }) {
    const { pdfId } = await context.params;

    return middlewareFactory(
        { cors: true, auth: true, role: ["admin", "reviewer"] },
        (req, session) => postHandler(req, session, pdfId)
    )(req);
}

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
