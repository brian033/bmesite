"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DocumentUploader from "./DocumentUploader";
import DocumentViewer from "@/app/components/DocumentViewer";
import { useState } from "react";
import SubmissionCard from "./SubmissionCard";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
import { TypedSession } from "@/lib/getTypedSession";
import { UploadedPdf } from "@/types/user";

// function groupAndSortDocuments(documents: Document[]): Document[] {
//     const groupedByTitle: Record<string, Document[]> = {};

//     // 1. 分組
//     for (const doc of documents) {
//         const title = doc.title || "unknown";
//         if (!groupedByTitle[title]) groupedByTitle[title] = [];
//         groupedByTitle[title].push(doc);
//     }

//     // 2. 排序並加上 colorGroup
//     let colorGroupCounter = 1;
//     const result: Document[] = [];

//     for (const title of Object.keys(groupedByTitle)) {
//         const group = groupedByTitle[title];

//         const uploadedDocs = group
//             .filter((doc) => doc.detailedInfo?.documentStatus === "uploaded")
//             .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

//         const otherDocs = group
//             .filter((doc) => doc.detailedInfo?.documentStatus !== "uploaded")
//             .sort(
//                 (a, b) =>
//                     new Date(a.submissionInfo?.submissionUpdatedAt || 0).getTime() -
//                     new Date(b.submissionInfo?.submissionUpdatedAt || 0).getTime()
//             );

//         const fullGroup = [...uploadedDocs, ...otherDocs].map((doc) => ({
//             ...doc,
//             colorGroup: colorGroupCounter,
//         }));

//         result.push(...fullGroup);
//         colorGroupCounter++;
//     }

//     return result;
// }
// function groupAndSortDocuments2(documents: Document[]): {
//     uploadedDocuments: Document[];
//     otherDocuments: Document[];
// } {
//     const groupedByTitle: Record<string, Document[]> = {};

//     // 1. 根據 title 分組
//     for (const doc of documents) {
//         const title = doc.title || "unknown";
//         if (!groupedByTitle[title]) groupedByTitle[title] = [];
//         groupedByTitle[title].push(doc);
//     }

//     let colorGroupCounter = 1;
//     const uploadedResults: Document[] = [];
//     const otherResults: Document[] = [];

//     // 2. 走過每個 title 分組
//     for (const title of Object.keys(groupedByTitle)) {
//         const group = groupedByTitle[title];

//         const uploadedDocs = group
//             .filter((doc) => doc.detailedInfo?.documentStatus === "uploaded")
//             .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

//         const otherDocs = group
//             .filter((doc) => doc.detailedInfo?.documentStatus !== "uploaded")
//             .sort(
//                 (a, b) =>
//                     new Date(a.submissionInfo?.submissionUpdatedAt || 0).getTime() -
//                     new Date(b.submissionInfo?.submissionUpdatedAt || 0).getTime()
//             );

//         uploadedResults.push(
//             ...uploadedDocs.map((doc) => ({ ...doc, colorGroup: colorGroupCounter }))
//         );

//         otherResults.push(...otherDocs.map((doc) => ({ ...doc, colorGroup: colorGroupCounter })));

//         colorGroupCounter++;
//     }

//     return {
//         uploadedDocuments: uploadedResults,
//         otherDocuments: otherResults,
//     };
// }

type DocumentCardProps = {
    pdfType: string;
    documents: Document[];
    submissions: Submission[];
    session: TypedSession;
};
const DocumentCard = ({ pdfType, documents, submissions, session }: DocumentCardProps) => {
    // documents = groupAndSortDocuments(documents);
    // filter out documents that are in the
    const uploadedDocument: UploadedPdf[] = session.user.uploaded_pdfs[pdfType];
    // get all of the "pdfId" from the uploadedDocument
    const uploadedDocumentIds = uploadedDocument.map((doc) => doc.pdfId);
    // filter out documents that are in the uploadedDocument
    const uploadedDocumentList = documents.filter((doc) => {
        return uploadedDocumentIds.includes(doc.documentId) && doc.documentStatus === "uploaded";
    });

    return (
        <div>
            <SubmissionCard submissions={submissions} documents={documents} />
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Manage your {pdfType}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <DocumentListViewer documents={uploadedDocumentList} pdfType={pdfType} />
                    <Separator className="my-4" />
                    {/* <DocumentListViewer documents={otherDocuments} pdfType={pdfType} /> */}
                </CardContent>
            </Card>
        </div>
    );
};

const DocumentListViewer = ({ documents, pdfType }: { documents: Document[]; pdfType: string }) => {
    const [uploading, setUploading] = useState(false);

    return (
        <div>
            {!documents ? (
                <p className="text-muted-foreground">尚未上傳任何檔案。</p>
            ) : (
                documents.map((doc, i) => (
                    <div key={doc.documentId || i} className="space-y-2">
                        {JSON.stringify(doc)}
                        <details>
                            <summary className="cursor-pointer font-semibold text-lg text-gray-700">
                                📄 文件標題：
                                <span>{doc.title}</span> （未送審）
                            </summary>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    上傳時間: {doc.createdAt}
                                </p>
                                <p className="text-sm text-muted-foreground">主題: {doc.topic}</p>
                                <p className="text-sm text-muted-foreground">
                                    發表形式:{" "}
                                    {doc.present_type == "oral" ? "oral presentation" : "poster"}
                                </p>
                                <DocumentViewer
                                    fileUrl={`/api/user_uploads${doc.documentLocation.replace(
                                        /^\/[^/]+/,
                                        ""
                                    )}`}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        onClick={async () => {
                                            setUploading(true);
                                            const res = await fetch(
                                                `/api/documents/${doc.documentId}`,
                                                {
                                                    method: "POST",
                                                }
                                            );
                                            setUploading(false);
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert(`✅ 成功送出審稿: ${data.message}`);
                                                location.reload();
                                            } else {
                                                alert(`❌ 送出失敗: ${data.error}`);
                                            }
                                        }}
                                    >
                                        {uploading ? "送出中..." : "📤 送出審稿"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            const res = await fetch(
                                                "/api/attendee/remove_document",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        pdfId: doc.documentId,
                                                        pdftype: pdfType,
                                                    }),
                                                }
                                            );
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert("🗑️ 成功移除檔案！");
                                                location.reload();
                                            } else {
                                                alert(`❌ 移除失敗: ${data.error}`);
                                            }
                                        }}
                                    >
                                        🗑️ 移除檔案
                                    </Button>
                                </div>

                                <Separator className="my-4" />
                            </div>
                        </details>
                    </div>
                ))
            )}
        </div>
    );
};

export default DocumentCard;
