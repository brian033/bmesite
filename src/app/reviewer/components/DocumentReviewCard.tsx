"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function DocumentReviewCard({
    documentId,
    documentLocation,
    documentStatus,
    notes,
    createdAt,
    reviewedBy,
    ownerInfo,
    title,
    hasReviewed,
}: {
    documentId: string;
    documentLocation: string;
    documentStatus: string;
    notes: string[];
    createdAt: string;
    reviewedBy: any[];
    ownerInfo: {
        name?: string;
        department?: string;
        email?: string;
        phone?: string;
    };
    title?: string;
    hasReviewed?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [reviewNote, setReviewNote] = useState("");
    const [approved, setApproved] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLatest = title.includes("最新");

    const handleAddNote = async () => {
        setIsSubmitting(true);
        const res = await fetch(`/api/documents/${documentId}/addnotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: noteText }),
        });
        setIsSubmitting(false);
        if (res.ok) {
            alert("新增備註成功！");
            setNoteText("");
        } else {
            alert("新增備註失敗！");
        }
    };

    const handleSubmitReview = async () => {
        setIsSubmitting(true);
        const res = await fetch(`/api/documents/${documentId}/addreview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                approved,
                note: reviewNote,
            }),
        });
        setIsSubmitting(false);
        if (res.ok) {
            alert("審稿提交成功！");
            setReviewNote("");
        } else {
            alert("審稿提交失敗！");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between gap-2">
                <CardTitle className="text-base font-medium">
                    📄 {title}（{hasReviewed ? "您已審核此文件" : "您未審核此文件"}）
                </CardTitle>
                <div className="flex gap-2">
                    <Badge variant="secondary">狀態：{documentStatus}</Badge>
                    <span className="text-sm text-muted-foreground">
                        上傳時間：{new Date(createdAt).toLocaleString()}
                    </span>
                </div>
                <Button size="sm" onClick={() => setExpanded(!expanded)}>
                    {expanded ? "折疊內容" : "展開內容"}
                </Button>
            </CardHeader>

            {expanded && (
                <CardContent className="space-y-4">
                    <div className="grid gap-1 text-sm">
                        <p>
                            <strong>作者：</strong> {ownerInfo?.name || "未知"}
                        </p>
                        <p>
                            <strong>單位：</strong> {ownerInfo?.department || "未知"}
                        </p>
                        <div>
                            <strong>備註：</strong>
                            {notes?.length === 0
                                ? "無"
                                : notes.map((note, i) => (
                                      <div key={i} className="ml-2 text-muted-foreground">
                                          {note}
                                      </div>
                                  ))}
                        </div>
                        <div>
                            <strong>審稿紀錄：</strong>
                            {reviewedBy.length === 0
                                ? "無"
                                : reviewedBy.map((entry: any, i: number) => (
                                      <div key={i} className="ml-2">
                                          [{entry.reviewedAt}] {entry.reviewer}（
                                          {entry.approved ? "通過" : "拒絕"}）: {entry.note}
                                      </div>
                                  ))}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button className="w-full" variant="secondary" asChild>
                            <a
                                href={`/api/admin/user_uploads${documentLocation}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                查看文件（新分頁）
                            </a>
                        </Button>
                        <details className="w-full">
                            <summary className="cursor-pointer text-sm font-medium bg-muted px-3 py-1.5 rounded-md hover:bg-muted/80">
                                查看文件（預覽）
                            </summary>
                            <div className="mt-2">
                                <embed
                                    src={`/api/admin/user_uploads${documentLocation}`}
                                    width="100%"
                                    height="900px"
                                    type="application/pdf"
                                />
                            </div>
                        </details>
                    </div>

                    <Separator />

                    {/* 備註欄位 */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">新增備註：</h4>
                        <Textarea
                            rows={3}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="寫下你的備註..."
                        />
                        <Button
                            className="mt-2"
                            onClick={handleAddNote}
                            disabled={isSubmitting || !noteText}
                        >
                            新增備註
                        </Button>
                    </div>

                    {/* 審稿欄位 */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">審核文件：</h4>
                        <Textarea
                            rows={3}
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="輸入審稿備註"
                        />
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="approve"
                                    checked={approved}
                                    onChange={() => setApproved(true)}
                                />
                                通過
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="reject"
                                    checked={!approved}
                                    onChange={() => setApproved(false)}
                                />
                                拒絕
                            </label>
                        </div>
                        <Button
                            className="mt-2 bg-destructive hover:bg-destructive/90"
                            onClick={handleSubmitReview}
                            disabled={isSubmitting || !reviewNote}
                        >
                            送出審核
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
