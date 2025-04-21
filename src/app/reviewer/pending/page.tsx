// src/app/reviewer/pending/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import SubmissionReviewCard from "../components/SubmissionReviewCard";
import clientPromise from "@/lib/mongodb";

function cleanObject(obj: any): any {
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (obj && typeof obj === "object") {
        if (typeof obj.toString === "function" && obj.toString().startsWith("ObjectId(")) {
            return obj.toString(); // 或者 obj.toHexString() 如果是 _id
        }

        if (Array.isArray(obj)) {
            return obj.map(cleanObject);
        }

        const result: Record<string, any> = {};
        for (const key in obj) {
            result[key] = cleanObject(obj[key]);
        }
        return result;
    }

    return obj;
}

const queryDocumentDetail = async (submissions: any[], db: any) => {
    const documentsDB = db.collection("documents");

    // Collect all file IDs
    const allFileIds = submissions.flatMap((sub) => sub.submissionFiles);
    const uniqueFileIds = [...new Set(allFileIds)];

    // Query once
    const docs = await documentsDB.find({ documentId: { $in: uniqueFileIds } }).toArray();

    // Convert documents to pure JSON
    const cleanDocs = docs.map(cleanObject);

    const docMap = new Map(cleanDocs.map((d) => [d.documentId, d]));

    // Clean and map each submission
    const userDB = db.collection("users");

    // 取得所有 submissionOwner 的 UUID，去重後查詢
    const allOwnerUUIDs = [...new Set(submissions.map((sub) => sub.submissionOwner))];
    const owners = await userDB
        .find({ uuid: { $in: allOwnerUUIDs } })
        .project({ _id: 0, uuid: 1, name: 1, department: 1, contact_email: 1 }) // 精簡欄位
        .toArray();

    const ownerMap = new Map(owners.map((user) => [user.uuid, user]));

    return submissions.map((sub) => ({
        ...sub,
        _id: sub._id?.toString?.() ?? undefined,
        submissionCreatedAt: sub.submissionCreatedAt?.toISOString?.() ?? null,
        submissionUpdatedAt: Array.isArray(sub.submissionUpdatedAt)
            ? sub.submissionUpdatedAt.map((d: Date) => d?.toISOString?.())
            : sub.submissionUpdatedAt?.toISOString?.() ?? null,
        submssionFileDetail: sub.submissionFiles
            .map((id: string) => docMap.get(id))
            .filter(Boolean),
        submissionOwnerDetails: ownerMap.get(sub.submissionOwner) || null,
    }));
};

export default async function ReviewerPendingPage() {
    await withRoleProtection(["reviewer", "admin"]);

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
