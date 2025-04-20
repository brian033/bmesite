"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DocumentUploader from "./DocumentUploader";
import DocumentViewer from "@/app/components/DocumentViewer";
import { useState } from "react";
import SubmissionCard from "./SubmissionCard";

type Document = {
    uploadedAt: string;
    detailedInfo: {
        documentStatus: string;
    };
    submissionInfo?: {
        submissionUpdatedAt?: string;
    };
    [key: string]: any;
};

function groupAndSortDocuments(documents: Document[]): Document[] {
    const groupedByTitle: Record<string, Document[]> = {};

    // 1. 分組
    for (const doc of documents) {
        const title = doc.title || "unknown";
        if (!groupedByTitle[title]) groupedByTitle[title] = [];
        groupedByTitle[title].push(doc);
    }

    // 2. 排序並加上 colorGroup
    let colorGroupCounter = 1;
    const result: Document[] = [];

    for (const title of Object.keys(groupedByTitle)) {
        const group = groupedByTitle[title];

        const uploadedDocs = group
            .filter((doc) => doc.detailedInfo?.documentStatus === "uploaded")
            .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());

        const otherDocs = group
            .filter((doc) => doc.detailedInfo?.documentStatus !== "uploaded")
            .sort(
                (a, b) =>
                    new Date(a.submissionInfo?.submissionUpdatedAt || 0).getTime() -
                    new Date(b.submissionInfo?.submissionUpdatedAt || 0).getTime()
            );

        const fullGroup = [...uploadedDocs, ...otherDocs].map((doc) => ({
            ...doc,
            colorGroup: colorGroupCounter,
        }));

        result.push(...fullGroup);
        colorGroupCounter++;
    }

    return result;
}

const DocumentCard = ({ pdfType, documents, submissions }) => {
    const [uploading, setUploading] = useState(false);
    documents = groupAndSortDocuments(documents);
    const colorPalette = [
        "text-red-500",
        "text-blue-500",
        "text-green-500",
        "text-yellow-500",
        "text-purple-500",
        "text-pink-500",
        "text-orange-500",
    ];

    return (
        <div>
            <SubmissionCard submissions={submissions} />
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Manage your {pdfType}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {!documents ? (
                        <p className="text-muted-foreground">尚未上傳任何檔案。</p>
                    ) : (
                        documents.map((doc, i) => (
                            <div key={doc.pdfId || i} className="space-y-2">
                                {doc.detailedInfo.documentStatus === "pending" ? (
                                    <details>
                                        <summary className="cursor-pointer font-semibold text-lg text-gray-700">
                                            📄 文件標題：
                                            <span
                                                className={`px-2 py-1 rounded-sm bg-opacity-50 ${
                                                    colorPalette[
                                                        doc.colorGroup % colorPalette.length
                                                    ]
                                                }`}
                                            >
                                                {doc.title}
                                            </span>{" "}
                                            （已送審）
                                        </summary>
                                        <div className="mt-2 space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                上傳時間:{" "}
                                                {new Date(doc.uploadedAt).toLocaleString()}
                                            </p>
                                            <DocumentViewer
                                                fileUrl={`/api/user_uploads${doc.pdf}`}
                                            />
                                            <Separator className="my-4" />
                                        </div>
                                    </details>
                                ) : (
                                    <details open>
                                        <summary className="cursor-pointer font-semibold text-lg text-gray-700">
                                            📄 文件標題：
                                            <span
                                                className={`px-2 py-1 rounded-sm bg-opacity-50 ${
                                                    colorPalette[
                                                        doc.colorGroup % colorPalette.length
                                                    ]
                                                }`}
                                            >
                                                {doc.title}
                                            </span>{" "}
                                            （未送審）
                                        </summary>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                上傳時間:{" "}
                                                {new Date(doc.uploadedAt).toLocaleString()}
                                            </p>
                                            <DocumentViewer
                                                fileUrl={`/api/user_uploads${doc.pdf}`}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="default"
                                                    onClick={async () => {
                                                        setUploading(true);
                                                        const res = await fetch(
                                                            `/api/documents/${doc.pdfId}`,
                                                            {
                                                                method: "POST",
                                                            }
                                                        );
                                                        setUploading(false);
                                                        const data = await res.json();
                                                        if (res.ok) {
                                                            alert(
                                                                `✅ 成功送出審稿: ${data.message}`
                                                            );
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
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify({
                                                                    pdfId: doc.pdfId,
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
                                )}
                            </div>
                        ))
                    )}

                    {/* uploader 放最下面 */}
                    <DocumentUploader pdfType={pdfType} />
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentCard;
