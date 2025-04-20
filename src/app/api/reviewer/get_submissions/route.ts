// src/app/api/reviewer/get_submissions/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const handler = async (req: NextRequest, session: any) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const submissionId = searchParams.get("submissionid");

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const submissionDB = db.collection("submissions");

        // ✅ 查詢特定 submissionId
        if (submissionId) {
            const submission = await submissionDB.findOne({ submissionId: submissionId });

            if (!submission) {
                return NextResponse.json({ error: "Submission not found" }, { status: 404 });
            }
            const detailedSubmission = await queryDocumentDetail([submission], db);

            return NextResponse.json(detailedSubmission, { status: 200 });
        }

        // ✅ 查詢所有 submission 或指定 status
        if (!status) {
            const submissions = await submissionDB.find({}).toArray();
            const detailedSubmission = await queryDocumentDetail(submissions, db);
            return NextResponse.json(detailedSubmission, { status: 200 });
        }

        // ✅ 檢查 status 是否有效
        const validStatuses = ["pending", "accepted", "rejected"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const submissions = await submissionDB.find({ submissionStatus: status }).toArray();
        const detailedSubmission = await queryDocumentDetail(submissions, db);

        return NextResponse.json(detailedSubmission, { status: 200 });
    } catch (err) {
        console.error("Error fetching documents:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

const queryDocumentDetail = async (submissions: any[], db: any) => {
    const documentsDB = db.collection("documents");

    // Collect all file IDs
    const allFileIds = submissions.flatMap((sub) => sub.submissionFiles);
    const uniqueFileIds = [...new Set(allFileIds)];

    // Query once
    const docs = await documentsDB.find({ documentId: { $in: uniqueFileIds } }).toArray();

    // Convert documents to pure JSON
    const cleanDocs = docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
        createdAt: doc.createdAt?.toISOString?.() ?? null,
        reviewedAt: doc.reviewedAt?.map?.((d: Date) => d.toISOString?.()) ?? [],
    }));

    const docMap = new Map(cleanDocs.map((d) => [d.documentId, d]));

    // Clean and map each submission
    return submissions.map((sub) => ({
        ...sub,
        _id: sub._id?.toString?.() ?? undefined,
        submissionCreatedAt: sub.submissionCreatedAt?.toISOString?.() ?? null,
        submissionUpdatedAt: sub.submissionUpdatedAt?.toISOString?.() ?? null,
        submssionFileDetail: sub.submissionFiles
            .map((id: string) => docMap.get(id))
            .filter(Boolean),
    }));
};

export const GET = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
