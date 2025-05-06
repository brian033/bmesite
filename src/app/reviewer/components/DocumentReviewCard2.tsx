"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types/document";

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
    const [reviewNote, setReviewNote] = useState("");
    const [approved, setApproved] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddNote = async () => {
        setIsSubmitting(true);
        const res = await fetch(`/api/documents/${document.documentId}/addnotes`, {
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

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between gap-2">
                <CardTitle className="text-base font-medium">
                    <span>
                        📄 {latest ? "最新版本" : `版本 ${version}`}（
                        {hasReviewed ? "您已評論過此文件" : "您未評論過此文件"}）
                    </span>
                    <span className="text-sm text-muted-foreground">
                        上傳時間：{document.createdAt}
                    </span>
                </CardTitle>
                <Button className="cursor-pointer" size="sm" onClick={() => setExpanded(!expanded)}>
                    {expanded ? "折疊內容" : "展開內容"}
                </Button>
            </CardHeader>

            {expanded && (
                <CardContent className="space-y-4">
                    <div className="grid gap-1 text-sm">
                        <div>
                            <strong>評論：</strong>
                            {document.notes?.length === 0
                                ? "無"
                                : document.notes.map((note, i) => (
                                      <div key={i} className="ml-2 text-muted-foreground">
                                          <span className="font-semibold">
                                              {note.noteCreatorName}：
                                          </span>
                                          {note.note}@
                                          <span className="text-xs text-muted-foreground">
                                              {new Date(note.createdAt).toLocaleString()}
                                          </span>
                                      </div>
                                  ))}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button className="w-full" variant="secondary" asChild>
                            <a
                                href={`/api/admin/user_uploads${document.documentLocation}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                查看文件（新分頁）
                            </a>
                        </Button>
                        {/* <details className="w-full">
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
                        </details> */}
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
                        <Button
                            className="cursor-pointer mt-2"
                            onClick={handleAddNote}
                            disabled={isSubmitting || !noteText}
                        >
                            新增評論
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
