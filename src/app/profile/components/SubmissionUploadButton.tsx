"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Submission } from "@/types/submission";

type Props = {
    submission: Submission;
};

export default function SubmissionUploadButton({ submission }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [description, setDescription] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setMessage("請先選擇檔案");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("submissionId", submission.submissionId);
        formData.append("description", description);

        try {
            const res = await fetch("/api/submissions", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "上傳失敗");

            setMessage("上傳成功 ✅");
            setFile(null);
            setOpen(false);
            location.reload();
        } catch (err: any) {
            setMessage(err.message || "上傳失敗");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)}>上傳文件</Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>上傳文件 - {submission.submissionTitle}</DialogTitle>
                    </DialogHeader>

                    <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="mt-4">
                        <label className="text-sm font-medium">備註說明</label>
                        <textarea
                            className="w-full mt-1 p-2 border rounded-md text-sm"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="選填"
                        />
                    </div>

                    {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}

                    <DialogFooter>
                        <Button onClick={handleUpload} disabled={!file || uploading}>
                            {uploading ? "上傳中..." : "送出"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
