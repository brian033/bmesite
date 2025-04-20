// src/app/reviewer/pending/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import SubmissionReviewCard from "../components/SubmissionReviewCard";
import clientPromise from "@/lib/mongodb";

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

export default async function ReviewerPendingPage() {
    const session = await withRoleProtection(["reviewer", "admin"]);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const submissionDB = db.collection("submissions");

    const submissions = await submissionDB.find({ submissionStatus: "pending" }).toArray();
    const detailedSubmission = await queryDocumentDetail(submissions, db);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">待審核文件</h1>
            {detailedSubmission.length === 0 ? (
                <p className="text-muted-foreground">目前沒有 pending 的文件。</p>
            ) : (
                detailedSubmission.map((sub: any) => (
                    <SubmissionReviewCard key={sub.submissionId} submission={sub} />
                ))
            )}
        </div>
    );
}
