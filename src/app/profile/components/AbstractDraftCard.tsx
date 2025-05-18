"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DocumentViewer from "@/app/components/DocumentViewer";
import { useState } from "react";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
import { CheckCircle, XCircle } from "lucide-react";

interface DocumentCardProps {
    document: Document;
    pdfType: string;
    onDocumentRemoved: (documentId: string) => void;
    onDocumentSubmitted: (documentId: string, submission: Submission) => void;
}

// 單個文件卡片組件
function DocumentCard({
    document: doc,
    pdfType,
    onDocumentRemoved,
    onDocumentSubmitted,
}: DocumentCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // 顯示訊息的輔助函數
    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    // 處理送出審稿
    const handleSubmitForReview = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/documents/${doc.documentId}`, {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok) {
                showMessage("success", data.message || "文件已成功送出審稿");
                if (data.submission) {
                    onDocumentSubmitted(doc.documentId, data.submission);
                }
            } else {
                showMessage("error", data.error || "送出失敗");
            }
        } catch (error) {
            showMessage("error", "送出過程中發生錯誤");
        } finally {
            setIsProcessing(false);
        }
    };

    // 處理移除文件
    const handleRemoveDocument = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/attendee/remove_document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pdfId: doc.documentId, pdftype: pdfType }),
            });
            const data = await res.json();

            if (res.ok) {
                showMessage("success", "文件已成功刪除");
                onDocumentRemoved(doc.documentId);
            } else {
                showMessage("error", data.error || "刪除失敗");
            }
        } catch (error) {
            showMessage("error", "刪除過程中發生錯誤");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-2">
            {message && (
                <Alert
                    className={`mb-4 ${
                        message.type === "success"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                    }`}
                >
                    <AlertDescription className="flex items-center gap-2">
                        {message.type === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {message.text}
                    </AlertDescription>
                </Alert>
            )}

            <details onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
                <summary className="cursor-pointer font-semibold text-lg text-gray-700">
                    📄 文件標題：
                    <span>{doc.title}</span> （未送審）
                </summary>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">上傳時間: {doc.createdAt}</p>
                    <p className="text-sm text-muted-foreground">主題: {doc.topic}</p>
                    <p className="text-sm text-muted-foreground">
                        發表形式: {doc.present_type === "oral" ? "oral presentation" : "poster"}
                    </p>
                    <DocumentViewer
                        fileUrl={`/api/user_uploads${doc.documentLocation.replace(/^\/[^/]+/, "")}`}
                        isOpen={isOpen}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            onClick={handleSubmitForReview}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "送出中..." : "📤 送出審稿"}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveDocument}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "處理中..." : "🗑️ 移除檔案"}
                        </Button>
                    </div>
                    <Separator className="my-4" />
                </div>
            </details>
        </div>
    );
}

// 主要組件
export default function AbstractDraftCard({
    documents,
    onDocumentRemoved,
    onDocumentSubmitted,
}: {
    documents: Document[];
    onDocumentRemoved: (documentId: string) => void;
    onDocumentSubmitted: (documentId: string, submission: Submission) => void;
}) {
    const pdfType = "abstracts";

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>管理您的摘要草稿</CardTitle>
            </CardHeader>
            <CardContent>
                {!documents || documents.length === 0 ? (
                    <p className="text-muted-foreground">尚未上傳任何檔案。</p>
                ) : (
                    documents.map((doc) => (
                        <DocumentCard
                            key={doc.documentId}
                            document={doc}
                            pdfType={pdfType}
                            onDocumentRemoved={onDocumentRemoved}
                            onDocumentSubmitted={onDocumentSubmitted}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
