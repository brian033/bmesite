"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getSerial } from "@/app/profile/components/SubmissionCard";
import { SubmissionWithDetailedInfo } from "../page";
import { SubmissionPropertiesChanger } from "./SubmissionPropertiesChanger";
import { SubmissionStatusChanger } from "./SubmissionStatusChanger"; // 引入新組件
import { Document } from "@/types/document";
import DocumentReviewCard2 from "./DocumentReviewCard2";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import NextAuth, { DefaultSession } from "next-auth";
import { User } from "@/types/user";

declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];
    }
}

const STATUS_DISPLAY = {
    pending: "待審核",
    accepted: "已接受",
    rejected: "已拒絕",
    replied: "退回修改",
    waiting: "等待全文",
};

export default function SubmissionReviewCard2({
    submission,
}: {
    submission: SubmissionWithDetailedInfo;
}) {
    const [expanded, setExpanded] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(submission.submissionTopic);
    const [currentPresentType, setCurrentPresentType] = useState(submission.submissionPresentType);
    const [uploading, setUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [fileDescription, setFileDescription] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 使用本地狀態管理文件列表，初始化為原始文件列表
    const [documentFiles, setDocumentFiles] = useState<Document[]>(
        submission.submissionFiles || []
    );
    // 添加提交數據狀態用於狀態變更
    const [submissionData, setSubmissionData] = useState(submission);

    const handlePropertiesChange = (newTopic, newPresentType) => {
        setCurrentTopic(newTopic);
        setCurrentPresentType(newPresentType);
    };

    const { data: session } = useSession();

    const statusColor = {
        pending: "bg-yellow-200 text-yellow-800",
        rejected: "bg-red-200 text-red-800",
        replied: "bg-blue-200 text-blue-800",
        accepted: "bg-green-300 text-green-900", // 使用 accepted 作為接受狀態
        waiting: "bg-gray-200 text-gray-800",
    };

    // 處理狀態變更
    const handleStatusChange = (updatedSubmission?: SubmissionWithDetailedInfo) => {
        if (updatedSubmission) {
            // 更新本地提交數據狀態
            setSubmissionData(updatedSubmission);

            // 當狀態變更時，可能還需要更新其他相關狀態
            // 例如，可能需要更新顯示的主題和發表類型
            if (updatedSubmission.submissionTopic !== currentTopic) {
                setCurrentTopic(updatedSubmission.submissionTopic);
            }

            if (updatedSubmission.submissionPresentType !== currentPresentType) {
                setCurrentPresentType(updatedSubmission.submissionPresentType);
            }

            console.log("提交狀態已更改為:", updatedSubmission.submissionStatus);
        }
    };

    const latestDoc = documentFiles.at(-1);
    const documentCounts = documentFiles.length;
    const serial = getSerial(
        submission.submissionPresentType,
        submission.submissionTopic,
        submission.submissionId
    );

    const handleFileUpload = async () => {
        // ... 原有上傳邏輯保持不變
        setUploadError("");
        setUploadSuccess(false);

        if (!fileInputRef.current?.files?.length) {
            setUploadError("請選擇檔案");
            return;
        }

        const file = fileInputRef.current.files[0];

        // 檢查檔案類型
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        if (submission.submissionType === "abstracts") {
            if (fileExt !== "pdf") {
                setUploadError("摘要審稿案只允許上傳 PDF 格式文件");
                return;
            }
        } else {
            if (fileExt !== "docx" && fileExt !== "doc") {
                setUploadError("論文審稿案只允許上傳 Word 文件");
                return;
            }
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("submissionId", submission.submissionId);
            formData.append("description", fileDescription);

            const response = await fetch("/api/reviewer/upload_modified_document", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "上傳失敗");
            }

            const result = await response.json();

            // 成功上傳
            setUploadSuccess(true);

            // 將新文件添加到本地狀態
            if (result.document) {
                // 添加新上傳的文件到文件列表
                setDocumentFiles((prevFiles) => [...prevFiles, result.document]);

                // 自動展開文件列表以顯示新文件
                setExpanded(true);

                setTimeout(() => {
                    setUploadDialogOpen(false);
                    setFileDescription("");
                    setUploadSuccess(false);
                }, 1500);
            }
        } catch (error) {
            console.error("上傳失敗:", error);
            setUploadError(`上傳失敗: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const openUploadDialog = () => {
        setUploadError("");
        setUploadSuccess(false);
        setFileDescription("");
        setUploadDialogOpen(true);
    };

    return (
        <Card className="w-full shadow">
            <CardContent className="pt-4 pb-0">
                <div className="space-y-4">
                    {/* 屬性變更器 */}
                    <SubmissionPropertiesChanger
                        submissionId={submission.submissionId}
                        currentTopic={currentTopic}
                        currentPresentType={currentPresentType}
                        onPropertiesChange={handlePropertiesChange}
                    />
                </div>
            </CardContent>

            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <CardTitle className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xl font-semibold text-primary">
                                {submission.submissionTitle}
                            </span>
                            {submissionData.submissionStatus === "pending" && (
                                <Badge className="bg-red-500 text-white">需要審核</Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge
                                className={
                                    statusColor[submissionData.submissionStatus] ||
                                    "bg-gray-200 text-gray-800"
                                }
                            >
                                狀態：
                                {STATUS_DISPLAY[submissionData.submissionStatus] ||
                                    submissionData.submissionStatus}
                            </Badge>

                            <Badge variant="outline" className="bg-gray-50">
                                {submissionData.submissionType === "abstracts" ? "摘要" : "全文"}
                            </Badge>
                        </div>

                        <div className="text-base font-medium text-primary">編號： {serial}</div>

                        <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span className="font-medium">上傳者：</span>
                                <span>{submission.submissionOwner.name || "未知"}</span>
                                <span className="text-gray-400">
                                    （{submission.submissionOwner.department || "無單位"}）
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium">聯絡信箱：</span>
                                <span>{submission.submissionOwner.contact_email || "未提供"}</span>
                            </div>
                        </div>
                    </CardTitle>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                    <p className="text-sm text-muted-foreground">
                        建立於 {submission.submissionCreatedAt}
                    </p>
                    <div className="flex flex-col md:flex-row gap-2">
                        <Button
                            className="cursor-pointer"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                // 創建包含單個審稿案ID的JSON字符串作為查詢參數
                                const submissionParam = JSON.stringify([submission.submissionId]);
                                // 構建URL
                                const url = `/reviewer?submissions=${encodeURIComponent(
                                    submissionParam
                                )}`;
                                // 在新分頁中打開
                                window.open(url, "_blank");
                            }}
                        >
                            在新分頁開啟
                        </Button>

                        <Button
                            className="cursor-pointer"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            variant="outline"
                        >
                            {expanded
                                ? "⬆️ 收合此審稿案"
                                : `📂 展開 [${
                                      submission.submissionStatus !== "pending"
                                          ? "無新文件待審核"
                                          : "有新文件待審核"
                                  }]`}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="space-y-4">
                    {documentFiles.map((doc: Document, index: number) => (
                        <div key={doc.documentId}>
                            <DocumentReviewCard2
                                document={doc}
                                latest={index === documentFiles.length - 1}
                                hasReviewed={doc.notes.some(
                                    (n) => n.noteCreatorId === session?.user?.uuid
                                )}
                                version={index.toString()}
                            />
                        </div>
                    ))}
                    {/* 狀態變更器 */}
                    <Button
                        className="cursor-pointer w-full"
                        size="sm"
                        onClick={openUploadDialog}
                        variant="default"
                    >
                        📤 上傳審稿修改文件
                    </Button>
                    <SubmissionStatusChanger
                        submission={submissionData}
                        onStatusChange={handleStatusChange}
                    />

                    <div className="text-center text-sm text-muted-foreground">
                        總文件數量：{documentFiles.length}
                    </div>
                </CardContent>
            )}

            {/* 審稿者上傳文件對話框 */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>上傳審稿修改文件</DialogTitle>
                        <DialogDescription>
                            您可以上傳修改後的文件版本，此文件將以審稿者身份附加到此審稿案。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {uploadError && (
                            <Alert variant="destructive">
                                <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                        )}

                        {uploadSuccess && (
                            <Alert className="bg-green-50 text-green-800 border-green-300">
                                <AlertDescription>文件已成功上傳！</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="file">選擇文件</Label>
                            <Input
                                ref={fileInputRef}
                                id="file"
                                type="file"
                                accept={
                                    submission.submissionType === "abstracts"
                                        ? ".pdf"
                                        : ".doc,.docx"
                                }
                                disabled={uploading || uploadSuccess}
                            />
                            <p className="text-xs text-muted-foreground">
                                {submission.submissionType === "abstracts"
                                    ? "只接受 PDF 格式"
                                    : "只接受 Word 格式 (.doc, .docx)"}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">文件說明</Label>
                            <Textarea
                                id="description"
                                placeholder="請描述此文件的修改內容或目的..."
                                rows={3}
                                value={fileDescription}
                                onChange={(e) => setFileDescription(e.target.value)}
                                disabled={uploading || uploadSuccess}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setUploadDialogOpen(false)}
                            disabled={uploading}
                        >
                            取消
                        </Button>
                        <Button onClick={handleFileUpload} disabled={uploading || uploadSuccess}>
                            {uploading ? "上傳中..." : "上傳文件"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
