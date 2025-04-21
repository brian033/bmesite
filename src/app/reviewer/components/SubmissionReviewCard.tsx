"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import DocumentReviewCard from "./DocumentReviewCard";

export default function SubmissionReviewCard({ submission }: { submission: any }) {
    const [expanded, setExpanded] = useState(false);
    const { data: session } = useSession();
    const statusColor = {
        pending: "bg-yellow-200 text-yellow-800",
        accepted: "bg-green-200 text-green-800",
        rejected: "bg-red-200 text-red-800",
    };

    const latestDoc = submission.submssionFileDetail.at(-1);
    const reviewedLatest = latestDoc?.reviewedBy?.some(
        (r: any) => r.reviewerEmail === session?.user?.email
    );

    const documentCounts = submission.submssionFileDetail.length;

    return (
        <Card className="w-full shadow">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <CardTitle className="text-xl font-semibold">
                        審稿案：{submission.submissionTitle}
                    </CardTitle>
                    <Badge className={statusColor[submission.submissionStatus]}>
                        狀態：{submission.submissionStatus}
                    </Badge>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                    <p className="text-sm text-muted-foreground">
                        建立於 {submission.submissionCreatedAt}
                    </p>
                    <Button size="sm" onClick={() => setExpanded(!expanded)} variant="outline">
                        {expanded
                            ? "⬆️ 收合此審稿案"
                            : `📂 展開 [${reviewedLatest ? "無新文件待審核" : "有新文件待審核"}]`}
                    </Button>
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="space-y-4">
                    {submission.submssionFileDetail.map((doc: any, index: number) => (
                        <div key={doc.documentId}>
                            <DocumentReviewCard
                                documentId={doc.documentId}
                                documentLocation={doc.documentLocation}
                                documentStatus={doc.documentStatus}
                                notes={doc.notes}
                                createdAt={doc.createdAt}
                                reviewedBy={doc.reviewedBy}
                                ownerInfo={doc.ownerInfo}
                                title={`(${documentCounts == index + 1 ? "最新" : "舊"})第${
                                    index + 1
                                }版`}
                                hasReviewed={doc.reviewedBy?.some(
                                    (r) => r.reviewerEmail === session?.user?.email
                                )}
                            />
                            {index < submission.submssionFileDetail.length - 1 && (
                                <Separator className="my-4" />
                            )}
                        </div>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}
