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

interface DocumentUploaderProps {
    pdfType: string;
    onDocumentUploaded: (document: Document) => void;
}

const DocumentUploader = ({ pdfType, onDocumentUploaded }: DocumentUploaderProps) => {
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
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("請上傳PDF檔案");
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
            const response = await fetch("/api/attendee/upload_documents", {
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
                <CardTitle className="text-center text-2xl">上傳文件</CardTitle>
                <p className="text-sm text-muted-foreground mb-4">
                    📌
                    每個標題會建立一個對應的審查案件，若再次送出相同標題的文件，系統將自動更新原有的審查案。
                    <br />
                    ✍️ 簡短敘述是提供給審稿者的內容說明。
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
                        <Label>PDF檔案</Label>
                        <Input type="file" accept="application/pdf" onChange={handleFileChange} />
                    </div>

                    <div className="space-y-1">
                        <Label>標題</Label>
                        <Input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="輸入標題"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>投稿主題</Label>
                        <Select value={noteTopic} onValueChange={(value) => setNoteTopic(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="請選擇投稿主題" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="生物產業機械">生物產業機械（A）</SelectItem>
                                <SelectItem value="生物生產工程">生物生產工程（B）</SelectItem>
                                <SelectItem value="畜牧自動化與污染防治">
                                    畜牧自動化與污染防治（C）
                                </SelectItem>
                                <SelectItem value="農業設施與環控工程">
                                    農業設施與環控工程（D）
                                </SelectItem>
                                <SelectItem value="生物機電控制">生物機電控制（E）</SelectItem>
                                <SelectItem value="生醫工程與微奈米機電">
                                    生醫工程與微奈米機電（F）
                                </SelectItem>
                                <SelectItem value="生物資訊與系統">生物資訊與系統（G）</SelectItem>
                                <SelectItem value="能源與節能技術">能源與節能技術（H）</SelectItem>
                                <SelectItem value="AI與大數據分析">AI與大數據分析（I）</SelectItem>
                                <SelectItem value="精準農業智動化">精準農業智動化（J）</SelectItem>
                                <SelectItem value="農機安全"> 農機安全（K）</SelectItem>
                                <SelectItem value="其他新興科技">其他新興科技（L）</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>發表形式</Label>
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
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>簡短敘述</Label>
                        <Textarea
                            value={noteDescription}
                            onChange={(e) => setNoteDescription(e.target.value)}
                            placeholder="輸入簡短敘述"
                        />
                    </div>

                    <Button type="submit" disabled={uploading} className="w-full">
                        {uploading ? "上傳中..." : "上傳 PDF"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DocumentUploader;
