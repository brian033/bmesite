"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DocumentReviewCard from "./DocumentReviewCard";

type Props = {
    submission: {
        submissionId: string;
        submissionTitle: string;
        submissionStatus: string;
        submissionType: string;
        submissionCreatedAt: string;
        submissionUpdatedAt: string;
        submssionFileDetail: {
            documentId: string;
            documentLocation: string;
            documentStatus: string;
            title: string;
            description: string;
            createdAt: string;
            reviewedBy: string[];
            notes: any[];
            ownerInfo?: any;
        }[];
    };
};

export default function SubmissionReviewCard({ submission }: Props) {
    const statusColor = {
        pending: "bg-yellow-200 text-yellow-800",
        accepted: "bg-green-200 text-green-800",
        rejected: "bg-red-200 text-red-800",
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold">
                    審稿案：{submission.submissionTitle}
                </CardTitle>
                <Badge
                    className={statusColor[submission.submissionStatus as keyof typeof statusColor]}
                >
                    狀態：{submission.submissionStatus}
                </Badge>
                <p className="text-sm text-muted-foreground">
                    建立於 {submission.submissionCreatedAt}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {submission.submssionFileDetail.map((doc) => (
                    <div key={doc.documentId}>
                        <DocumentReviewCard
                            documentId={doc.documentId}
                            documentLocation={doc.documentLocation}
                            documentStatus={doc.documentStatus}
                            notes={doc.notes}
                            createdAt={doc.createdAt}
                            reviewedBy={doc.reviewedBy}
                            ownerInfo={doc.ownerInfo}
                        />
                        <Separator className="my-4" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
