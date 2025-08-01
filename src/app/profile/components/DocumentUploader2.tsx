"use client";
import { useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";

// 更新 props 接口以接收新的回調
interface DocumentUploaderProps {
    pdfType: string;
    onDocumentUploaded: (document: Document) => void;
    onSubmissionCreated?: (submission: Submission) => void; // 添加新的回調
}

const DocumentUploader2 = ({
    pdfType,
    onDocumentUploaded,
    onSubmissionCreated,
}: DocumentUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [presentType, setPresentType] = useState("");
    const [noteTitle, setNoteTitle] = useState("");
    const [noteDescription, setNoteDescription] = useState("");
    const [noteTopic, setNoteTopic] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (
            selectedFile &&
            (selectedFile.type === "application/pdf" ||
                selectedFile.type === "application/msword" || // .doc
                selectedFile.type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document") // .docx
        ) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("請上傳PDF或Word文件");
        }
    };

    const resetForm = () => {
        setFile(null);
        setNoteTitle("");
        setNoteDescription("");
        setNoteTopic("");
        setPresentType("");
        // 重置文件選擇器
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("尚未選擇檔案");
            return;
        }

        if (!noteTitle.trim()) {
            setError("標題為必填欄位。");
            return;
        }
        if (!noteTopic.trim()) {
            setError("請選擇投稿主題。");
            return;
        }
        if (!presentType.trim()) {
            setError("請選擇發表形式。");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pdftype", pdfType);
        formData.append("title", noteTitle);
        formData.append("description", noteDescription);
        formData.append("topic", noteTopic);
        formData.append("presentType", presentType);

        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/attendee/upload_document_and_submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "上傳失敗");
            }

            // 設定成功訊息
            setSuccessMessage("文件上傳成功！");

            // 重置表單
            resetForm();

            // 通知父組件新增了文件
            if (data.document) {
                onDocumentUploaded(data.document);
            }

            // 通知父組件新增了審稿案
            if (data.submission && onSubmissionCreated) {
                onSubmissionCreated(data.submission);
            }

            // 5秒後清除成功訊息
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (err) {
            setError(err.message || "上傳文件時發生錯誤");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="max-w-full mx-auto">
            <CardHeader>
                <p className="text-sm text-muted-foreground mb-4">
                    📌
                    每個標題會建立一個對應的審查案件，若再次送出相同標題的文件，系統將自動更新原有的審查案。
                    <br />
                    📌 Each title will create a corresponding review case. If a document with the
                    same title is submitted again, the system will automatically update the existing
                    case.
                    <br />
                    ✍️ 簡短敘述是提供給審稿者的內容說明。
                    <br />
                    ✍️ A brief description is intended to help reviewers understand the submission
                    content.
                </p>
            </CardHeader>
            <CardContent>
                {successMessage && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                        <AlertDescription className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert className="mb-4 bg-red-50 border-red-200">
                        <AlertDescription className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>上傳檔案 File upload</Label>
                        <Input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            支援的格式 supported extentions：PDF、Word (.doc, .docx)
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label>標題 Title</Label>
                        <Input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="輸入標題"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>投稿主題 Topic</Label>
                        <Select value={noteTopic} onValueChange={(value) => setNoteTopic(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="請選擇投稿主題" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="生物產業機械">
                                    生物產業機械（A） / Bio-Industrial Machinery (A)
                                </SelectItem>
                                <SelectItem value="生物生產工程">
                                    生物生產工程（B） / Bio-Production Engineering (B)
                                </SelectItem>
                                <SelectItem value="畜牧自動化與污染防治">
                                    畜牧自動化與污染防治（C） / Livestock Automation & Pollution
                                    Control (C)
                                </SelectItem>
                                <SelectItem value="農業設施與環控工程">
                                    農業設施與環控工程（D） / Agricultural Facilities &
                                    Environmental Control Engineering (D)
                                </SelectItem>
                                <SelectItem value="生物機電控制">
                                    生物機電控制（E） / Bio-Mechatronic Control (E)
                                </SelectItem>
                                <SelectItem value="生醫工程與微奈米機電">
                                    生醫工程與微奈米機電（F） / Biomedical & Micro/Nano Mechatronics
                                    (F)
                                </SelectItem>
                                <SelectItem value="生物資訊與系統">
                                    生物資訊與系統（G） / Bioinformatics & Systems (G)
                                </SelectItem>
                                <SelectItem value="能源與節能技術">
                                    能源與節能技術（H） / Energy & Energy-Saving Technologies (H)
                                </SelectItem>
                                <SelectItem value="AI與大數據分析">
                                    AI與大數據分析（I） / AI & Big Data Analytics (I)
                                </SelectItem>
                                <SelectItem value="精準農業智動化">
                                    精準農業智動化（J） / Precision Agriculture & Automation (J)
                                </SelectItem>
                                <SelectItem value="農機安全">
                                    農機安全（K） / Agricultural Machinery Safety (K)
                                </SelectItem>
                                <SelectItem value="其他新興科技">
                                    其他新興科技（L） / Other Emerging Technologies (L)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>發表形式 Presentation type</Label>
                        <Select
                            value={presentType}
                            onValueChange={(value) => setPresentType(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="請選擇發表形式" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="poster">海報發表（Poster）</SelectItem>
                                <SelectItem value="oral">口頭發表（Oral）</SelectItem>
                                <SelectItem value="undecided">
                                    Oral/Poster都可以（Let the reviewers decide）{" "}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>簡短敘述 Brief description</Label>
                        <Textarea
                            value={noteDescription}
                            onChange={(e) => setNoteDescription(e.target.value)}
                            placeholder="輸入簡短敘述"
                        />
                    </div>

                    <Button type="submit" disabled={uploading} className="w-full">
                        {uploading ? "Uploading..." : "Upload Document"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DocumentUploader2;
