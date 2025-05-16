"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DocumentViewer from "@/app/components/DocumentViewer";
import { useState } from "react";
import { Document } from "@/types/document";
import { TypedSession } from "@/lib/getTypedSession";
import { UploadedPdf } from "@/types/user";

type DocumentCardProps = {
    documents: Document[];
    session: TypedSession;
};
const pdfType = "abstracts";

const AbstractDraftCard = ({ documents, session }: DocumentCardProps) => {
    const uploadedDocument: UploadedPdf[] = session.user.uploaded_pdfs[pdfType];
    // get all of the "pdfId" from the uploadedDocument
    const uploadedDocumentIds = uploadedDocument.map((doc) => doc.pdfId);
    // filter out documents that are in the uploadedDocument
    const uploadedDocumentList = documents.filter((doc) => {
        return uploadedDocumentIds.includes(doc.documentId) && doc.documentStatus === "uploaded";
    });

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>管理您的摘要草稿</CardTitle>
            </CardHeader>
            <CardContent>
                <AbstractDraftListViewer documents={uploadedDocumentList} pdfType={pdfType} />
            </CardContent>
        </Card>
    );
};

const AbstractDraftListViewer = ({
    documents,
    pdfType,
}: {
    documents: Document[];
    pdfType: string;
}) => {
    const [uploading, setUploading] = useState(false);

    return (
        <div>
            {!documents ? (
                <p className="text-muted-foreground">尚未上傳任何檔案。</p>
            ) : (
                documents.map((doc, i) => (
                    <div key={doc.documentId || i} className="space-y-2">
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

export default AbstractDraftCard;
