// src/app/reviewer/pending/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import DocumentReviewCard from "../components/DocumentReviewCard";

export default async function ReviewerPendingPage() {
    const session = await withRoleProtection(["reviewer", "admin"]);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    // const docs = await db.collection("documents").find({ documentStatus: "pending" }).toArray();
    const docs = await db
        .collection("documents")
        .aggregate([
            { $match: { documentStatus: "pending" } },
            {
                $lookup: {
                    from: "users",
                    localField: "documentOwner",
                    foreignField: "uuid",
                    as: "ownerInfo",
                },
            },
            { $unwind: "$ownerInfo" }, // 將 array 攤平
            {
                $project: {
                    documentId: 1,
                    documentLocation: 1,
                    documentStatus: 1,
                    createdAt: 1,
                    notes: 1,
                    reviewedBy: 1,
                    "ownerInfo.name": 1,
                    "ownerInfo.email": 1,
                    "ownerInfo.department": 1,
                    "ownerInfo.phone": 1,
                },
            },
        ])
        .toArray();

    return (
        <div style={{ padding: "2rem" }}>
            <h1>待審核文件</h1>
            {docs.length === 0 ? (
                <p>目前沒有 pending 的文件。</p>
            ) : (
                docs.map((doc) => (
                    <div key={doc.documentId} style={{ marginBottom: "2rem" }}>
                        <DocumentReviewCard
                            documentId={doc.documentId}
                            documentLocation={doc.documentLocation}
                            documentStatus={doc.documentStatus}
                            notes={doc.notes}
                            createdAt={doc.createdAt}
                            reviewedBy={doc.reviewedBy}
                            ownerInfo={doc.ownerInfo}
                        />
                    </div>
                ))
            )}
        </div>
    );
}
