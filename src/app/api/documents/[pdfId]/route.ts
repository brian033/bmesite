// src/app/api/documents/[pdfId]/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid"; // 這個 uuid 是用來產生新的 submissionId 的
import { Submission } from "@/types/submission";
import { Document } from "@/types/document";
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
        const documentsDB = db.collection("documents");
        const submissionDB = db.collection("submissions");
        const usersDB = db.collection("users");
        // this is Document
        const doc = (await documentsDB.findOne({ documentId: pdfId })) as Document;

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (doc.documentOwner !== session.user.uuid) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (doc.documentStatus !== "uploaded") {
            return NextResponse.json(
                {
                    error: `此文件已經被繳交過，若想更新資料請上傳新文件！ ${doc.documentStatus}`,
                },
                { status: 400 }
            );
        }

        // 檢查是否有同 title 的 submission

        const existingSubmission = await submissionDB.findOne({
            submissionTitle: doc.title,
            submissionType: doc.pdfType,
            submissionOwner: session.user.uuid,
        });
        // submission status: " pending" | "approved" | "rejected"
        if (!existingSubmission) {
            // 如果沒有同title的submission，則新建一個 submission
            const newSubmission: Omit<Submission, "_id"> = {
                submissionId: uuidv4(),
                submissionTitle: doc.title,
                submissionType: doc.pdfType,
                submissionStatus: "pending",
                submissionOwner: session.user.uuid,
                submissionTopic: doc.topic,
                submissionPresentType: doc.present_type,
                submissionFiles: [pdfId],
                submissionCreatedAt: new Date().toISOString(),
                submissionUpdatedAt: new Date().toISOString(),
                submissionReviewedBy: [],
                submissionReviewedAt: "",
            };
            await submissionDB.insertOne(newSubmission);

            // 更新使用者的 collection, 在user.submission.[pdftype].push(newSubmission.submissionId)
            await usersDB.updateOne(
                { uuid: session.user.uuid },
                {
                    $push: {
                        [`submission.${doc.pdfType}`]: newSubmission.submissionId,
                    },
                }
            );
            await documentsDB.updateOne(
                { documentId: pdfId },
                { $set: { documentStatus: "pending" } }
            );
            return NextResponse.json(
                {
                    success: true,
                    newStatus: "pending",
                    message: `成功新建審稿案，標題為\"${doc.title}\"。`,
                    submission: newSubmission,
                },
                { status: 200 }
            );
        } else {
            // 有這個 summission，那就不給上傳
            return NextResponse.json(
                {
                    success: false,
                    error: `已經有一個標題為\"${existingSubmission.submissionTitle}\"的審稿案在進行中，請至審稿區查看！`,
                },
                { status: 400 }
            );
        }
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
