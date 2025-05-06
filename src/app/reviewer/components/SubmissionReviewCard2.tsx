"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getSerial } from "@/app/profile/components/SubmissionCard";
import { SubmissionWithDetailedInfo } from "../page";
import { SubmissionPropertiesChanger } from "./SubmissionPropertiesChanger";
import { Document } from "@/types/document";
import DocumentReviewCard2 from "./DocumentReviewCard2";

import NextAuth, { DefaultSession } from "next-auth";
import { User } from "@/types/user";

declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];
    }
}

export default function SubmissionReviewCard2({
    submission,
}: {
    submission: SubmissionWithDetailedInfo;
}) {
    const [expanded, setExpanded] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(submission.submissionTopic);
    const [currentPresentType, setCurrentPresentType] = useState(submission.submissionPresentType);

    const handlePropertiesChange = (newTopic, newPresentType) => {
        setCurrentTopic(newTopic);
        setCurrentPresentType(newPresentType);
    };
    const { data: session } = useSession();
    //submissionStatus: "pending" | "replied" | "rejected" | "approved" | "waiting";
    const statusColor = {
        pending: "bg-yellow-200 text-yellow-800",
        rejected: "bg-red-200 text-red-800",
        replied: "bg-blue-200 text-blue-800",
        approved: "bg-green-300 text-green-900",
        waiting: "bg-gray-200 text-gray-800",
    };

    const latestDoc = submission.submissionFiles.at(-1);

    const documentCounts = submission.submissionFiles.length;
    const serial = getSerial(
        submission.submissionPresentType,
        submission.submissionTopic,
        submission.submissionId
    );

    return (
        <Card className="w-full shadow">
            <CardContent>
                <SubmissionPropertiesChanger
                    submissionId={submission.submissionId}
                    currentTopic={currentTopic}
                    currentPresentType={currentPresentType}
                    onPropertiesChange={handlePropertiesChange}
                />
            </CardContent>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <CardTitle className="text-xl font-semibold leading-snug">
                        標題：<span className="text-primary">{submission.submissionTitle}</span>
                        編號：<span className="text-primary">{serial}</span>
                        <div className="mt-1 text-sm text-muted-foreground">
                            上傳者：{submission.submissionOwner.name || "未知"}（
                            {submission.submissionOwner.department || "無單位"}）
                        </div>
                        <div className="text-sm text-muted-foreground">
                            聯絡信箱：{submission.submissionOwner.contact_email || "未提供"}
                        </div>
                    </CardTitle>
                    <Badge className={statusColor[submission.submissionStatus]}>
                        狀態：{submission.submissionStatus}
                    </Badge>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                    <p className="text-sm text-muted-foreground">
                        建立於 {submission.submissionCreatedAt}
                    </p>
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
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-4">
                    {submission.submissionFiles.map((doc: Document, index: number) => (
                        <div key={doc.documentId}>
                            {JSON.stringify(doc)}
                            <DocumentReviewCard2
                                document={doc}
                                latest={index === submission.submissionFiles.length - 1}
                                hasReviewed={doc.notes.some(
                                    (n) => n.noteCreatorId === session?.user?.uuid
                                )}
                                version={index.toString()}
                            />
                        </div>
                    ))}
                    <div className="text-center text-sm text-muted-foreground">
                        總文件數量：{submission.submissionFiles.length}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
