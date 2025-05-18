"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types/document";
import { useSession } from "next-auth/react";
import DocxPreview from "@/app/components/DocxPreview";
import { formatToUTC8 } from "@/lib/formatToUTC8";
import DocumentViewer from "@/app/components/DocumentViewer";
export default function DocumentReviewCard2({
    document,
    latest,
    hasReviewed,
    version,
}: {
    document: Document;
    latest: boolean;
    hasReviewed: boolean;
    version: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // 添加本地狀態來存儲評論
    const [localNotes, setLocalNotes] = useState(document.notes || []);
    // 獲取 session 資訊
    const { data: session } = useSession();

    // 判斷是否為審稿者上傳的文件
    const isReviewerDocument = document.isReviewerUpload === true;

    // 判斷當前用戶是否為文件上傳者
    const isCurrentUserUploader = session?.user?.uuid === document.reviewerId;

    const handleAddNote = async () => {
        if (!noteText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/documents/${document.documentId}/addnotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: noteText }),
            });

            if (!res.ok) {
                throw new Error("Failed to add note");
            }

            const data = await res.json();

            if (data.success && data.newNote) {
                // 更新本地評論狀態
                setLocalNotes((prevNotes) => [...prevNotes, data.newNote]);
                setNoteText(""); // 清空文本框
                // 如果這是首次評論，更新 hasReviewed 狀態
                if (!hasReviewed && data.newNote.noteCreatorId === session?.user?.uuid) {
                    hasReviewed = true;
                }
            } else {
                throw new Error("Note data missing in response");
            }
        } catch (error) {
            console.error("添加評論時出錯:", error);
            alert("新增評論失敗！");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 處理文件說明顯示
    const fileDescription = document.description
        ? document.description.replace(/^\[審稿者修改\]\s*/, "")
        : "";

    return (
        <Card>
            <CardHeader className={`flex flex-col md:flex-row justify-between gap-2 `}>
                <div>
                    <CardTitle className="text-base font-medium flex items-start gap-2">
                        <span>
                            📄 [{document.pdfType}] {latest ? "最新文件" : `文件 ${version}`}
                            {/* 只有非審稿者上傳的文件才顯示評論狀態 */}
                        </span>

                        {isReviewerDocument ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600">審稿者修改版</Badge>
                        ) : (
                            <Badge className="bg-green-500 hover:bg-green-600">投稿者版本</Badge>
                        )}
                    </CardTitle>

                    <div className="text-sm text-muted-foreground mt-1">
                        上傳時間：{document.createdAt}
                        {/* 如果有文件描述，顯示部分簡短描述 */}
                        {fileDescription && (
                            <div className="mt-1">
                                簡短說明：
                                {fileDescription.length > 50
                                    ? `${fileDescription.substring(0, 50)}...`
                                    : fileDescription}
                            </div>
                        )}
                        {/* 顯示上傳者信息 */}
                        <div
                            className={`mt-1 font-medium ${
                                isReviewerDocument ? "text-blue-600" : "text-green-700"
                            }`}
                        >
                            {isReviewerDocument
                                ? isCurrentUserUploader
                                    ? "由您上傳"
                                    : `由審稿者 ${document.reviewerName || "未知"} 上傳`
                                : `由投稿者上傳`}
                        </div>
                    </div>
                </div>

                <Button
                    className="cursor-pointer"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    variant="default"
                >
                    {expanded ? "折疊內容" : "展開內容"}
                </Button>
            </CardHeader>

            {expanded && (
                <CardContent className="space-y-4">
                    {/* 如果是審稿者上傳的文件，顯示說明 */}
                    {isReviewerDocument && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                            <p className="font-medium text-blue-700">
                                這是由{isCurrentUserUploader ? "您" : "審稿者"}上傳的修改版本
                            </p>
                            {fileDescription && (
                                <p className="mt-1 text-blue-600 whitespace-pre-line">
                                    說明：{fileDescription}
                                </p>
                            )}
                        </div>
                    )}

                    {/* 投稿者上傳的文件且有描述時顯示描述 */}
                    {!isReviewerDocument && fileDescription && (
                        <div className="border border-green-200 rounded-md p-3 text-sm">
                            <p className="font-medium text-green-700">這是由投稿者上傳的原始文件</p>
                            <p className="mt-1 text-green-600 whitespace-pre-line">
                                說明：{fileDescription}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-1 text-sm">
                        <div>
                            <strong>評論：</strong>
                            {localNotes.length === 0 ? (
                                <span className="text-muted-foreground ml-2">無評論</span>
                            ) : (
                                localNotes.map((note, i) => (
                                    <div
                                        key={i}
                                        className="ml-2 text-muted-foreground mt-1 p-2 border-l-2 border-gray-200"
                                    >
                                        <span className="font-semibold text-primary">
                                            {note.noteCreatorName}：
                                        </span>
                                        <span className="whitespace-pre-line">{note.note}</span>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {formatToUTC8(note.createdAt)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="secondary"
                            asChild
                            className={`w-full ${
                                isReviewerDocument ? " hover:bg-blue-200" : " hover:bg-green-200"
                            }`}
                        >
                            <a
                                href={`/api/admin/user_uploads${document.documentLocation}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {document.pdfType === "abstracts"
                                    ? "新分頁打開PDF檔案"
                                    : "下載Word檔案"}
                            </a>
                        </Button>
                        {document.pdfType === "abstracts" ? (
                            <details
                                className="w-full"
                                onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
                            >
                                <summary
                                    className={`cursor-pointer text-sm font-medium px-3 py-1.5 rounded-md ${
                                        isReviewerDocument
                                            ? " hover:bg-blue-200"
                                            : " hover:bg-green-200"
                                    }`}
                                >
                                    預覽PDF
                                </summary>

                                <DocumentViewer
                                    fileUrl={`/api/admin/user_uploads${document.documentLocation} `}
                                    isOpen={isOpen}
                                />
                            </details>
                        ) : (
                            <details
                                className="w-full"
                                onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
                            >
                                <summary
                                    className={`cursor-pointer text-sm font-medium px-3 py-1.5 rounded-md ${
                                        isReviewerDocument
                                            ? " hover:bg-blue-200"
                                            : " hover:bg-green-200"
                                    }`}
                                >
                                    預覽Word檔(建議下載後使用)
                                </summary>
                                <DocxPreview
                                    fileUrl={`/api/admin/user_uploads${document.documentLocation}`}
                                    height="900px"
                                    isOpen={isOpen}
                                />
                            </details>
                        )}
                    </div>

                    <Separator />

                    {/* 備註欄位 */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">新增評論：</h4>
                        <Textarea
                            rows={3}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="寫下你的評論..."
                        />
                        <div className="flex justify-between items-center mt-2">
                            <Button
                                className="cursor-pointer"
                                onClick={handleAddNote}
                                disabled={isSubmitting || !noteText.trim()}
                            >
                                {isSubmitting ? "提交中..." : "新增評論"}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {noteText.length} 個字元
                            </span>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
