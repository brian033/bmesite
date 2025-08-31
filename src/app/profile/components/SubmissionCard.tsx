"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Submission } from "@/types/submission";
import DocumentViewer from "@/app/components/DocumentViewer";
import DocxPreview from "@/app/components/DocxPreview";
import SubmissionUploadButton from "./SubmissionUploadButton";
import { Document } from "@/types/document";
import { FileText, Clock, Calendar, Info, ExternalLink } from "lucide-react";
import { formatToUTC8 } from "@/lib/formatToUTC8";
interface SubmissionCardProps {
    submissions: Submission[];
    documents: Document[];
}

// 狀態顯示名稱對應
const STATUS_DISPLAY = {
    pending: "審核中",
    accepted: "已接受",
    rejected: "已拒絕",
    replied: "需修改重新提交",
    waiting: "等待提交全文",
};

// 狀態顏色對應
const STATUS_COLOR = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    replied: "bg-orange-100 text-orange-800 border-orange-200",
    waiting: "bg-blue-100 text-blue-800 border-blue-200",
};

const submissionSerialRules = {
    生物產業機械: "A",
    生物生產工程: "B",
    畜牧自動化與污染防治: "C",
    農業設施與環控工程: "D",
    生物機電控制: "E",
    生醫工程與微奈米機電: "F",
    生物資訊與系統: "G",
    能源與節能技術: "H",
    AI與大數據分析: "I",
    精準農業智動化: "J",
    農機安全: "K",
    其他新興科技: "L",
};

export const getSerial = (
    submissionPresentType: "oral" | "poster" | "undecided",
    submisssionTopic: string,
    submission_Id: string
) => {
    // submission Serial規則: [字母]+submissionId第一個part轉成數字後的前10位數字
    const present_type = submissionPresentType.charAt(0).toUpperCase();
    const prefix = submissionSerialRules[submisssionTopic || "其他新興科技"];
    const submissionIdPart = submission_Id.split("-")[0]; // 取UUID的第一個部分
    const numericValue = BigInt(`0x${submissionIdPart}`); // 將其轉為數字
    const serial = numericValue.toString().padStart(10, "0").slice(0, 10); // 取前10位並pad 0
    return `${present_type}${prefix ? prefix : "X"}${serial}`;
};

export default function SubmissionCard({ submissions, documents }: SubmissionCardProps) {
    const [open, setOpen] = useState(false);

    // 檢查是否有狀態為 replied 或 waiting 的提交案
    const hasActionRequiredSubmissions = submissions.some(
        // (s) => s.submissionStatus === "replied" || s.submissionStatus === "waiting"
        (s) => s.submissionStatus === "replied"
    );

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>審稿案管理 Submission management</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        onClick={() => setOpen(!open)}
                        className="cursor-pointer"
                        variant={hasActionRequiredSubmissions ? "default" : "outline"}
                    >
                        {open
                            ? "隱藏我的審稿案 hide submissions"
                            : "查看我的審稿案 view submissions"}
                        {hasActionRequiredSubmissions && (
                            <Badge className="ml-2 bg-red-500">需要處理 please check</Badge>
                        )}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        總案件數 total cases: {submissions.length}
                    </div>
                </div>

                {open && (
                    <div className="space-y-6">
                        {submissions.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center p-4 border rounded-md bg-gray-50">
                                尚無審稿紀錄
                                <br />
                                No submissions found.
                            </p>
                        ) : (
                            submissions.map((s: Submission, i) => {
                                // 計算這個提交案中的審稿者文件數量
                                const reviewerDocumentsCount = documents.filter(
                                    (doc) =>
                                        s.submissionFiles.includes(doc.documentId) &&
                                        doc.isReviewerUpload
                                ).length;

                                // 檢查是否可以上傳文件（改成只有退回的可以上傳）
                                const canUpload =
                                    s.submissionStatus === "replied"; // ||
                                    // s.submissionStatus === "waiting";

                                // 提交案的文件數組，包括投稿者和審稿者的
                                const submissionDocs = documents.filter((doc) =>
                                    s.submissionFiles.includes(doc.documentId)
                                );

                                // 生成序列號
                                const serial = getSerial(
                                    s.submissionPresentType,
                                    s.submissionTopic,
                                    s.submissionId
                                );

                                return (
                                    <div
                                        key={s.submissionId}
                                        className={`p-4 border-2 rounded-md ${
                                            canUpload
                                                ? "border-orange-300 bg-orange-50"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {/* 審稿案標題和狀態區塊 */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-gray-600" />
                                                    {s.submissionTitle}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    編號 Serial: {serial}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Badge
                                                    className={`${
                                                        STATUS_COLOR[s.submissionStatus] ||
                                                        "bg-gray-100"
                                                    } px-3 py-1 text-sm`}
                                                >
                                                    {STATUS_DISPLAY[s.submissionStatus] ||
                                                        s.submissionStatus}
                                                </Badge>

                                                {reviewerDocumentsCount > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        {reviewerDocumentsCount} 個審稿回饋文件 (
                                                        {reviewerDocumentsCount} reviewer uploads)
                                                    </Badge>
                                                )}

                                                <Badge variant="outline" className="bg-gray-50">
                                                    {s.submissionType === "abstracts"
                                                        ? "摘要 abstracts"
                                                        : "全文 full paper"}
                                                </Badge>
                                            </div>
                                        </div>
                                        {/* 如果需要上傳，顯示醒目的提示和上傳按鈕 */}
                                        {canUpload && (
                                            <div className="bg-orange-100 border border-orange-200 rounded-md p-3 mb-4">
                                                <div className="flex items-start gap-3">
                                                    <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-orange-800">
                                                            {s.submissionStatus === "replied"
                                                                ? "請修改後再次提交 please resubmit after modifications"
                                                                : "請提交全文 please submit full paper"}
                                                        </p>
                                                        <p className="text-sm text-orange-700 mt-1">
                                                            {s.submissionStatus === "replied"
                                                                ? "審稿者要求您針對意見修改後重新提交。 reviewers have requested you to resubmit after addressing their comments."
                                                                : "您的摘要已通過審核，請提交全文論文。 Your abstract has been accepted, please submit the full paper."}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <SubmissionUploadButton submission={s} />
                                                </div>
                                            </div>
                                        )}
                                        {/* 審稿案信息區塊 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-24">
                                                    主題
                                                    <br />
                                                    topic:
                                                </span>
                                                <span>{s.submissionTopic || "（未設定）"}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-24">
                                                    發表形式
                                                    <br />
                                                    presentation type:
                                                </span>
                                                <span>
                                                    {s.submissionPresentType === "oral"
                                                        ? "口頭發表(oral)"
                                                        : "海報發表(poster)"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-24">
                                                    檔案數量
                                                    <br />
                                                    file count:
                                                </span>
                                                <span>{s.submissionFiles.length}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-24">
                                                    建立時間
                                                    <br />
                                                    created at:
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatToUTC8(s.submissionCreatedAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-24">
                                                    最後更新
                                                    <br />
                                                    last update:
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatToUTC8(s.submissionUpdatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                        {/* 文件列表 */}
                                        <div className="space-y-1 mt-2">
                                            <details className="group">
                                                <summary className="font-medium mb-3 flex items-center gap-2 cursor-pointer list-none">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <ExternalLink className="h-4 w-4" />
                                                        相關文件 related documents (
                                                        {submissionDocs.length})
                                                        <svg
                                                            className="h-4 w-4 transition-transform group-open:rotate-180"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </div>
                                                </summary>

                                                <div className="pt-2">
                                                    <p>
                                                        點開以查看文件細節 click to view document
                                                        details
                                                    </p>
                                                    {submissionDocs.map((doc, j) => (
                                                        <DocumentDetail
                                                            document={doc}
                                                            key={doc.documentId}
                                                            version={j}
                                                        />
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function DocumentDetail({
    document,
    version,
}: {
    document: Document;
    version: number;
    key: string;
}) {
    // 判斷是否為審稿者上傳
    const isReviewerDocument = document.isReviewerUpload === true;

    return (
        <details
            className={`border rounded-lg p-2 my-2 ${
                isReviewerDocument ? "border-blue-300 bg-blue-50" : "border-green-300 bg-green-50"
            }`}
        >
            <summary className="cursor-pointer font-medium text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span>
                        📄 文件{version + 1}: {document.pdfType === "full_paper" ? "全文" : "摘要"}
                    </span>
                    {isReviewerDocument ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600">審稿者上傳</Badge>
                    ) : (
                        <Badge className="bg-green-500 hover:bg-green-600">投稿者上傳</Badge>
                    )}
                    {document.notes && document.notes.length > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600">
                            {document.notes.length} 個審稿評論
                        </Badge>
                    )}
                </div>
                <span className="text-xs text-gray-500">{formatToUTC8(document.createdAt)}</span>
            </summary>

            <div className="ml-4 mt-3 space-y-2 text-sm">
                <p className="font-medium">
                    {isReviewerDocument ? (
                        <span className="text-blue-600">
                            審稿者 {document.reviewerName || "未知"} 上傳的文件
                            <br />
                            uploaded by reviewer{" "}
                        </span>
                    ) : (
                        <span className="text-green-600">
                            您自行上傳的文件
                            <br />
                            Your upload
                        </span>
                    )}
                </p>

                <p>上傳時間 upload time：{formatToUTC8(document.createdAt)}</p>

                {document.description && (
                    <div
                        className={`p-2 rounded-md ${
                            isReviewerDocument
                                ? "bg-blue-100 border border-blue-200"
                                : "bg-green-100 border border-green-200"
                        }`}
                    >
                        <p className="font-medium mb-1">文件說明 document description：</p>
                        <p className="whitespace-pre-line">{document.description}</p>
                    </div>
                )}

                <p>主題 topic：{document.topic || "（未設定）"}</p>
                <p>
                    檔案類型 type：
                    {document.pdfType === "full_paper" ? "全文 full paper" : "摘要 abstract"}
                </p>

                <div className="mt-4">
                    <Button
                        variant="secondary"
                        className={`w-full ${
                            isReviewerDocument
                                ? "bg-blue-100 hover:bg-blue-200"
                                : "bg-green-100 hover:bg-green-200"
                        }`}
                        asChild
                    >
                        <a
                            href={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={document.pdfType === "full_paper"}
                        >
                            下載檔案 download file
                        </a>
                    </Button>

                    {/* {document.pdfType === "abstracts" ? (
                        <LazyLoadingPDF
                            isReviewerDocument={isReviewerDocument}
                            fileUrl={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                        />
                    ) : (
                        <LazyLoadingWord
                            isReviewerDocument={isReviewerDocument}
                            fileUrl={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                        />
                    )} */}
                    {document.documentLocation.toLowerCase().endsWith(".pdf") ? (
                        <LazyLoadingPDF
                            isReviewerDocument={isReviewerDocument}
                            fileUrl={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                        />
                    ) : document.documentLocation.toLowerCase().endsWith(".docx") ||
                      document.documentLocation.toLowerCase().endsWith(".doc") ? (
                        <LazyLoadingWord
                            isReviewerDocument={isReviewerDocument}
                            fileUrl={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                        />
                    ) : null}
                </div>

                {document.notes && document.notes.length > 0 && (
                    <div className="mt-4">
                        <p className="font-medium mb-2">審稿評論：</p>
                        {document.notes.map((note, index) => (
                            <div key={index} className="border-l-2 border-gray-300 pl-3 py-1 mb-2">
                                <p className="font-medium text-gray-700">
                                    {note.noteCreatorName || "審稿者"}
                                </p>
                                <p className="whitespace-pre-line">{note.note}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatToUTC8(note.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </details>
    );
}

function LazyLoadingPDF({
    isReviewerDocument,
    fileUrl,
}: {
    isReviewerDocument: boolean;
    fileUrl: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <details
            className="w-full mt-2"
            onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        >
            <summary
                className={`cursor-pointer text-sm font-medium px-3 py-1.5 rounded-md ${
                    isReviewerDocument
                        ? "bg-blue-100 hover:bg-blue-200"
                        : "bg-green-100 hover:bg-green-200"
                }`}
            >
                預覽PDF
            </summary>
            <div className="mt-2">
                <DocumentViewer fileUrl={fileUrl} isOpen={isOpen} />
            </div>
        </details>
    );
}

function LazyLoadingWord({
    isReviewerDocument,
    fileUrl,
}: {
    isReviewerDocument: boolean;
    fileUrl: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <details
            className="w-full mt-2"
            onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        >
            <summary
                className={`cursor-pointer text-sm font-medium px-3 py-1.5 rounded-md ${
                    isReviewerDocument
                        ? "bg-blue-100 hover:bg-blue-200"
                        : "bg-green-100 hover:bg-green-200"
                }`}
            >
                預覽Word
            </summary>
            <div className="mt-2">
                <DocxPreview fileUrl={fileUrl} isOpen={isOpen} />
            </div>
        </details>
    );
}
