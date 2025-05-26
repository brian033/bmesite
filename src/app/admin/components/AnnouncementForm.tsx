"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    PlusCircle,
    Trash2,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Announcement } from "@/types/announcement";

type NotificationType = "success" | "error" | "none";

export default function AnnouncementForm() {
    const [title, setTitle] = useState("");
    const [lines, setLines] = useState<string[]>([""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{
        type: NotificationType;
        title: string;
        message: string;
    }>({
        type: "none",
        title: "",
        message: "",
    });

    // 顯示通知
    const showNotification = (type: NotificationType, title: string, message: string) => {
        setNotification({ type, title, message });

        // 5秒後自動清除成功通知
        if (type === "success") {
            setTimeout(() => {
                setNotification((prev) =>
                    prev.type === "success" ? { type: "none", title: "", message: "" } : prev
                );
            }, 5000);
        }
    };

    // 處理內容行的變更
    const handleLineChange = (index: number, value: string) => {
        const newLines = [...lines];
        newLines[index] = value;
        setLines(newLines);
    };

    // 添加新行
    const addLine = () => {
        setLines([...lines, ""]);
    };

    // 移除行
    const removeLine = (index: number) => {
        if (lines.length > 1) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    // 提交表單
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 清除之前的通知
        setNotification({ type: "none", title: "", message: "" });

        // 過濾掉空行
        const filteredLines = lines.filter((line) => line.trim() !== "");

        if (!title.trim()) {
            showNotification("error", "標題錯誤", "請輸入公告標題");
            return;
        }

        if (filteredLines.length === 0) {
            showNotification("error", "內容錯誤", "請至少輸入一行公告內容");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    lines: filteredLines,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification("success", "發佈成功", "公告已成功發佈到網站");

                // 重置表單
                setTitle("");
                setLines([""]);
            } else {
                showNotification("error", "發佈失敗", data.error || "發佈公告時出現錯誤");
            }
        } catch (error) {
            showNotification("error", "系統錯誤", "無法連接到伺服器，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>發佈新公告</CardTitle>
                    <CardDescription>填寫公告標題與內容，發布後將顯示在網站首頁。</CardDescription>
                    <CardDescription>支援使用連結：[連結文字](網址)</CardDescription>
                    <CardDescription>
                        例如： [內部網站](/register) 或 [外部網站](https://example.com)
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* 通知提示 */}
                    {notification.type !== "none" && (
                        <Alert
                            variant={notification.type === "success" ? "default" : "destructive"}
                            className="mb-4"
                        >
                            {notification.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertTitle>{notification.title}</AlertTitle>
                            <AlertDescription>{notification.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* 標題輸入 */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            公告標題
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="輸入公告標題..."
                            disabled={isSubmitting}
                            className="w-full"
                        />
                    </div>

                    {/* 公告內容 - 多行 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">公告內容</label>
                        <div className="space-y-3">
                            {lines.map((line, index) => (
                                <div key={index} className="flex gap-2">
                                    <Textarea
                                        value={line}
                                        onChange={(e) => handleLineChange(index, e.target.value)}
                                        placeholder={`第 ${index + 1} 行內容...`}
                                        disabled={isSubmitting}
                                        className="flex-1 min-h-[60px] resize-none"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeLine(index)}
                                        disabled={lines.length === 1 || isSubmitting}
                                        className="h-10 w-10 flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">刪除行</span>
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* 添加新行按鈕 */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addLine}
                            disabled={isSubmitting}
                            className="mt-2"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            添加新行
                        </Button>
                    </div>

                    {/* 預覽區域 */}
                    {title.trim() !== "" || lines.some((line) => line.trim() !== "") ? (
                        <div className="mt-6 border rounded-md p-4 bg-muted/50">
                            <h4 className="font-medium mb-2">預覽</h4>
                            <div className="p-3 bg-background rounded border">
                                <h3 className="font-bold text-lg">{title || "(無標題)"}</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {lines.map(
                                        (line, index) =>
                                            line.trim() !== "" && <li key={index}>{line}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ) : null}
                </CardContent>

                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                發佈中...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                發佈公告
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
