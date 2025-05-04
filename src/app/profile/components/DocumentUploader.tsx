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

const DocumentUploader = ({ pdfType, existing_titles }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [useNewTitle, setUseNewTitle] = useState(existing_titles?.length === 0);
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
            setError("Please upload a valid PDF file.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("No file selected");
            return;
        }

        if (!noteTitle.trim() || !noteDescription.trim()) {
            setError("Please enter both title and description.");
            return;
        }
        if (!noteTopic.trim()) {
            setError("請選擇投稿主題。");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pdftype", pdfType);
        formData.append("title", noteTitle);
        formData.append("description", noteDescription);
        formData.append("topic", noteTopic);

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
                throw new Error(data.error || "Upload failed");
            }

            setSuccessMessage(`上傳成功，請重新整理後查看更新！`);
        } catch (err) {
            setError(err.message || "Error uploading file");
        } finally {
            setUploading(false);
        }
    };
    return (
        <Card className="max-w-md mx-auto">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>PDF檔案</Label>
                        <Input type="file" accept="application/pdf" onChange={handleFileChange} />
                    </div>

                    <div className="space-y-1">
                        <Label>標題</Label>
                        {useNewTitle || existing_titles?.length === 0 ? (
                            <Input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="Enter new title"
                            />
                        ) : (
                            <Select onValueChange={(value) => setNoteTitle(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an existing title" />
                                </SelectTrigger>
                                <SelectContent>
                                    {existing_titles.map((title: string, index: number) => (
                                        <SelectItem key={index} value={title}>
                                            {title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {existing_titles?.length > 0 && (
                            <Button
                                variant="link"
                                type="button"
                                className="text-sm text-blue-600 p-0"
                                onClick={() => setUseNewTitle(!useNewTitle)}
                            >
                                {useNewTitle ? "選擇已存在的標題" : "新增新的標題"}
                            </Button>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>投稿主題</Label>
                        <Select onValueChange={(value) => setNoteTopic(value)}>
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
                                <SelectItem value="精準農業自動化">精準農業自動化（J）</SelectItem>
                                <SelectItem value="其他新興科技">其他新興科技（K）</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>簡短敘述</Label>
                        <Textarea
                            value={noteDescription}
                            onChange={(e) => setNoteDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

                    <Button type="submit" disabled={uploading} className="w-full">
                        {uploading ? "Uploading..." : "Upload PDF"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DocumentUploader;
