"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Submission {
    submissionId: string;
    submissionTitle: string;
    submissionStatus: string;
    submissionCreatedAt: string;
    submissionUpdatedAt: string;
    submissionFiles: string[];
}

interface SubmissionCardProps {
    submissions: Submission[];
}

export default function SubmissionCard({ submissions }: SubmissionCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <Card className="mt-4">
            <CardContent className="p-4">
                <Button onClick={() => setOpen(!open)} className="cursor-pointer mb-4">
                    {open ? "隱藏我的審稿案" : "查看我的審稿案"}
                </Button>

                {open && (
                    <div className="space-y-4">
                        {submissions.length === 0 ? (
                            <p className="text-muted-foreground text-sm">尚無審稿紀錄</p>
                        ) : (
                            submissions.map((s, i) => (
                                <div key={s.submissionId} className="p-4 border rounded-md">
                                    <p className="font-semibold">
                                        {" "}
                                        🔍 文件標題: {s.submissionTitle}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        審稿案編號：{s.submissionId}
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
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
