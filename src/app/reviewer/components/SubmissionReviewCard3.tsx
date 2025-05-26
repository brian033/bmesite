"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { getSerial } from "@/app/profile/components/SubmissionCard";
import { SubmissionWithDetailedInfo } from "../page";
import { SubmissionStatusChanger } from "./SubmissionStatusChanger";
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
import { FileText, Clock, Calendar, Info, ExternalLink, Edit2, Check, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatToUTC8 } from "@/lib/formatToUTC8";
// 狀態顯示名稱對應
const STATUS_DISPLAY = {
    pending: "待審核",
    accepted: "已接受",
    rejected: "已拒絕",
    replied: "退回修改",
    waiting: "等待全文",
};

// 狀態顏色對應
const STATUS_COLOR = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    replied: "bg-orange-100 text-orange-800 border-orange-200",
    waiting: "bg-blue-100 text-blue-800 border-blue-200",
};

const TOPIC_OPTIONS = [
    "生物產業機械",
    "生物生產工程",
    "畜牧自動化與污染防治",
    "農業設施與環控工程",
    "生物機電控制",
    "生醫工程與微奈米機電",
    "生物資訊與系統",
    "能源與節能技術",
    "AI與大數據分析",
    "精準農業智動化",
    "其他新興科技",
];

export default function SubmissionReviewCard3({
    submissions,
}: {
    submissions: SubmissionWithDetailedInfo[];
}) {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    // 檢查是否有需要審核的案件
    const hasPendingSubmissions = submissions.some((s) => s.submissionStatus === "pending");

    return (
        <div className="space-y-6">
            {submissions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center p-4 border rounded-md bg-gray-50">
                    尚無審稿案
                </p>
            ) : (
                submissions.map((submission, index) => (
                    <div key={submission.submissionId}>
                        <SubmissionItem submission={submission} />
                    </div>
                ))
            )}
        </div>
    );
}

// 每個審稿案單獨的組件
function SubmissionItem({ submission }: { submission: SubmissionWithDetailedInfo }) {
    const [expanded, setExpanded] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(submission.submissionTopic);
    const [currentPresentType, setCurrentPresentType] = useState(submission.submissionPresentType);
    const [uploading, setUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [fileDescription, setFileDescription] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingProps, setEditingProps] = useState(false);
    const [isUpdatingProps, setIsUpdatingProps] = useState(false);
    const [showAllFiles, setShowAllFiles] = useState(false);
    const [propsMessage, setPropsMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // 使用本地状态管理文件列表和提交数据
    const [documentFiles, setDocumentFiles] = useState<Document[]>(
        submission.submissionFiles || []
    );
    const [submissionData, setSubmissionData] = useState(submission);

    const { data: session } = useSession();
    const serial = getSerial(
        submissionData.submissionPresentType,
        submissionData.submissionTopic,
        submissionData.submissionId
    );

    // 計算這個提交案中的審稿者文件數量
    const reviewerDocumentsCount = documentFiles.filter((doc) => doc.isReviewerUpload).length;

    // 处理属性编辑
    const handleEditPropsClick = () => {
        setEditingProps(true);
        setPropsMessage(null);
    };

    const handleCancelProps = () => {
        setEditingProps(false);
        setCurrentTopic(submissionData.submissionTopic);
        setCurrentPresentType(submissionData.submissionPresentType);
        setPropsMessage(null);
    };

    const handleSaveProps = async () => {
        if (
            currentTopic === submissionData.submissionTopic &&
            currentPresentType === submissionData.submissionPresentType
        ) {
            setEditingProps(false);
            return;
        }

        setIsUpdatingProps(true);
        setPropsMessage(null);

        try {
            const response = await fetch("/api/reviewer/modify_submission_properties", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submissionId: submissionData.submissionId,
                    updates: {
                        updatedTopic: currentTopic,
                        updatedPresentType: currentPresentType,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "更新屬性失敗");
            }

            setPropsMessage({ type: "success", text: "提交屬性已成功更新" });
            setEditingProps(false);
            setCurrentPresentType(currentPresentType);
            setCurrentTopic(currentTopic);
            // 更新本地状态
            setSubmissionData((prev) => ({
                ...prev,
                submissionTopic: currentTopic,
                submissionPresentType: currentPresentType,
            }));

            setTimeout(() => setPropsMessage(null), 5000);
        } catch (error) {
            console.error("更新屬性時出錯:", error);
            setPropsMessage({ type: "error", text: error.message || "更新失敗" });
            setTimeout(() => setPropsMessage(null), 5000);
        } finally {
            setIsUpdatingProps(false);
        }
    };

    // 处理状态变更
    const handleStatusChange = (updatedSubmission?: SubmissionWithDetailedInfo) => {
        if (updatedSubmission) {
            // 原本的submission還有一些資訊，updatedSubmission不會更新全部的，
            setSubmissionData((prev) => ({
                ...prev,
                submissionStatus: updatedSubmission.submissionStatus,
                submisssionType: updatedSubmission.submissionType,
            }));
        }
    };

    // 处理文件上传
    const handleFileUpload = async () => {
        setUploadError("");
        setUploadSuccess(false);

        if (!fileInputRef.current?.files?.length) {
            setUploadError("請選擇檔案");
            return;
        }

        const file = fileInputRef.current.files[0];

        // 检查文件类型
        const fileExt = file.name.split(".").pop()?.toLowerCase();

        if (fileExt !== "docx" && fileExt !== "doc" && fileExt !== "pdf") {
            setUploadError("只允許上傳 PDF, .doc, .docx 文件");
            return;
        }
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("submissionId", submissionData.submissionId);
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

            // 成功上传
            setUploadSuccess(true);

            // 将新文件添加到本地状态
            if (result.document) {
                setDocumentFiles((prevFiles) => [...prevFiles, result.document]);
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

    const needsReview = submissionData.submissionStatus === "pending";

    return (
        <div
            className={`p-4 border-2 rounded-md ${
                needsReview ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
            }`}
        >
            {/* 審稿案標題和狀態區塊 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        {submissionData.submissionTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">編號: {serial}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge
                        className={`${
                            STATUS_COLOR[submissionData.submissionStatus] || "bg-gray-100"
                        } px-3 py-1 text-sm`}
                    >
                        {STATUS_DISPLAY[submissionData.submissionStatus] ||
                            submissionData.submissionStatus}
                    </Badge>

                    {needsReview && <Badge className="bg-red-500 text-white">需要審核</Badge>}

                    {reviewerDocumentsCount > 0 && (
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                            {reviewerDocumentsCount} 個審稿回饋文件
                        </Badge>
                    )}

                    <Badge variant="outline" className="bg-gray-50">
                        {submissionData.submissionType === "abstracts" ? "摘要" : "全文"}
                    </Badge>
                </div>
            </div>

            {/* 审稿高亮提醒 */}
            {needsReview && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-md p-3 mb-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-yellow-800">此審稿案需要您審核</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                請審查文件並決定接受、拒絕或要求修改。
                            </p>
                        </div>
                    </div>
                    {/* <div className="mt-3 flex gap-2">
                        <Button onClick={() => setExpanded(!expanded)} variant="default" size="sm">
                            {expanded ? "收合檢視" : "展開審核"}
                        </Button>
                    </div> */}
                </div>
            )}

            {/* 属性区域 (可编辑) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">主題:</span>
                    <span>{currentTopic || "（未設定）"}</span>
                    {!editingProps && (
                        <Button
                            onClick={handleEditPropsClick}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">發表形式:</span>
                    <span>
                        {currentPresentType == "undecided"
                            ? "都可以"
                            : currentPresentType === "oral"
                            ? "口頭發表(oral)"
                            : "海報發表(poster)"}
                    </span>
                    {!editingProps && (
                        <Button
                            onClick={handleEditPropsClick}
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">檔案數量:</span>
                    <span>{documentFiles.length}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">上傳者:</span>
                    <span>{submissionData.submissionOwner.name || "未知"}</span>
                    <span className="text-gray-400">
                        ({submissionData.submissionOwner.department || "無單位"})
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">建立時間:</span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatToUTC8(submissionData.submissionCreatedAt)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">聯絡信箱:</span>
                    <span>{submissionData.submissionOwner.contact_email || "未提供"}</span>
                </div>
            </div>

            {/* 编辑属性的面板 - 只在编辑模式显示 */}
            {editingProps && (
                <div className="border rounded-md p-4 bg-gray-50 mb-4">
                    <h3 className="font-medium mb-3">編輯審稿案分類</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">主題</Label>
                            <Select
                                value={currentTopic}
                                onValueChange={(value) =>
                                    setCurrentTopic(value as typeof currentTopic)
                                }
                                disabled={isUpdatingProps}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="選擇主題" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOPIC_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>發表形式</Label>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="oral"
                                        value="oral"
                                        checked={currentPresentType === "oral"}
                                        onChange={() => setCurrentPresentType("oral")}
                                        disabled={isUpdatingProps}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="oral" className="cursor-pointer">
                                        口頭發表 (Oral)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="poster"
                                        value="poster"
                                        checked={currentPresentType === "poster"}
                                        onChange={() => setCurrentPresentType("poster")}
                                        disabled={isUpdatingProps}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="poster" className="cursor-pointer">
                                        海報發表 (Poster)
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleCancelProps}
                                variant="outline"
                                size="sm"
                                disabled={isUpdatingProps}
                            >
                                <X className="h-4 w-4 mr-1" /> 取消
                            </Button>
                            <Button
                                onClick={handleSaveProps}
                                variant="default"
                                size="sm"
                                disabled={isUpdatingProps}
                            >
                                {isUpdatingProps ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                        更新中...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-1" /> 保存變更
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {propsMessage && (
                        <div
                            className={`flex items-center gap-2 p-2 mt-2 rounded ${
                                propsMessage.type === "success"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {propsMessage.type === "success" ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                            <span className="text-sm">{propsMessage.text}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    onClick={() => setExpanded(!expanded)}
                    variant={expanded ? "outline" : needsReview ? "default" : "outline"}
                    size="sm"
                    className="flex-1 md:flex-none"
                >
                    {expanded ? "收起審稿案細節" : "展開審稿案細節"}
                </Button>

                <Button
                    onClick={() => {
                        const submissionParam = JSON.stringify([submissionData.submissionId]);
                        const url = `/reviewer?submissions=${encodeURIComponent(submissionParam)}`;
                        window.open(url, "_blank");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-none"
                >
                    在新分頁開啟
                </Button>
            </div>

            {/* 展开后显示的内容 */}
            {expanded && (
                <>
                    <Separator className="my-4" />

                    {/* 文件列表 */}
                    <div className="space-y-1 mt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            相關文件 ({documentFiles.length})
                        </h4>

                        {documentFiles.length > 3 && (
                            <div className="flex justify-center mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAllFiles(!showAllFiles)}
                                    className="w-full md:w-auto"
                                >
                                    {showAllFiles
                                        ? "只顯示最新3筆文件"
                                        : `載入全部文件 (共 ${documentFiles.length} 個)`}
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {(showAllFiles ? documentFiles : documentFiles.slice(-3)).map(
                                (doc: Document, index: number) => (
                                    <div key={doc.documentId}>
                                        <DocumentReviewCard2
                                            document={doc}
                                            latest={
                                                index ===
                                                (showAllFiles
                                                    ? documentFiles.length - 1
                                                    : Math.min(documentFiles.length, 3) - 1)
                                            }
                                            hasReviewed={doc.notes.some(
                                                (n) => n.noteCreatorId === session?.user?.uuid
                                            )}
                                            version={(index + 1).toString()}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* 审稿功能区 */}
                    <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
                        <Button
                            className="cursor-pointer w-full"
                            size="sm"
                            onClick={openUploadDialog}
                            variant="default"
                        >
                            📤 上傳審稿修改文件
                        </Button>

                        {/* 状态更改器 */}
                        <SubmissionStatusChanger
                            submission={submissionData}
                            onStatusChange={handleStatusChange}
                        />

                        <div className="text-center text-sm text-muted-foreground">
                            總文件數量：{documentFiles.length}
                        </div>
                    </div>
                </>
            )}

            {/* 审稿者上传文件对话框 */}
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
                                    submissionData.submissionType === "abstracts"
                                        ? ".pdf"
                                        : ".doc,.docx"
                                }
                                disabled={uploading || uploadSuccess}
                            />
                            <p className="text-xs text-muted-foreground">
                                {submissionData.submissionType === "abstracts"
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
        </div>
    );
}
