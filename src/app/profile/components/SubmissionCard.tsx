"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Submission } from "@/types/submission";
import DocumentViewer from "@/app/components/DocumentViewer";
import SubmissionUploadButton from "./SubmissionUploadButton";
import { Document } from "@/types/document";

interface SubmissionCardProps {
    submissions: Submission[];
    documents: Document[];
}
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
    其他新興科技: "K",
};
export const getSerial = (
    submissionPresentType: "oral" | "poster",
    submisssionTopic: string,
    submission_Id: string
) => {
    // submission Serial規則: [字母]+submissionId第一個part轉成數字後的前10位數字
    const present_type = submissionPresentType == "oral" ? "O" : "P";
    const prefix = submissionSerialRules[submisssionTopic || "其他新興科技"];
    const submissionIdPart = submission_Id.split("-")[0]; // 取UUID的第一個部分
    const numericValue = BigInt(`0x${submissionIdPart}`); // 將其轉為數字
    const serial = numericValue.toString().padStart(10, "0").slice(0, 10); // 取前10位並pad 0
    return `${present_type}${prefix ? prefix : "X"}${serial}`;
};

export default function SubmissionCard({ submissions, documents }: SubmissionCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <Card className="mt-4">
            {/* {JSON.stringify(submissions)}
            {JSON.stringify(documents)} */}
            <CardContent className="p-4">
                <Button onClick={() => setOpen(!open)} className="cursor-pointer mb-4">
                    {open ? "隱藏我的審稿案" : "查看我的審稿案"}
                </Button>

                {open && (
                    <div className="space-y-4">
                        {submissions.length === 0 ? (
                            <p className="text-muted-foreground text-sm">尚無審稿紀錄</p>
                        ) : (
                            submissions.map((s: Submission, i) => (
                                <div key={s.submissionId} className="p-4 border rounded-md">
                                    <SubmissionUploadButton submission={s} />
                                    <p className="font-semibold">
                                        {" "}
                                        🔍 文件標題: {s.submissionTitle}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        審稿案主題：{s.submissionTopic || "（未設定）"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        發表形式：{s.submissionPresentType || "（未設定）"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        審稿案編號：
                                        {getSerial(
                                            s.submissionPresentType,
                                            s.submissionTopic,
                                            s.submissionId
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        檔案數量：{s.submissionFiles.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        狀態：{s.submissionStatus}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        建立時間：{new Date(s.submissionCreatedAt).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        最後更新：{new Date(s.submissionUpdatedAt).toLocaleString()}
                                    </p>
                                    <Separator className="my-2" />
                                    {documents
                                        .filter((doc) => s.submissionFiles.includes(doc.documentId))
                                        .map((doc: Document, j: number) => (
                                            <DocumentDetail
                                                document={doc}
                                                key={doc.documentId}
                                                version={j}
                                            />
                                        ))}
                                </div>
                            ))
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
    return (
        <details>
            <summary className="cursor-pointer font-medium text-gray-800">
                📄 版本 {version + 1}: {document.pdfType === "full_paper" ? "全文" : "摘要"}
            </summary>
            <div className="ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                <p>上傳時間：{document.createdAt}</p>
                <p>描述：{document.description || "（無）"}</p>
                <p>主題：{document.topic || "（未設定）"}</p>
                <p>檔案類型：{document.pdfType === "full_paper" ? "全文" : "摘要"}</p>
                {document.pdfType === "abstracts" && (
                    <div>
                        PDF 預覽：
                        <DocumentViewer
                            fileUrl={`/api/user_uploads${document.documentLocation.replace(
                                /^\/[^/]+/,
                                ""
                            )}`}
                        />
                    </div>
                )}
                {document.pdfType === "full_paper" && (
                    <a
                        href={`/api/user_uploads${document.documentLocation.replace(
                            /^\/[^/]+/,
                            ""
                        )}`}
                        download
                        className="text-blue-600 underline hover:text-blue-800"
                    >
                        檔案下載
                    </a>
                )}
            </div>
        </details>
    );
}
