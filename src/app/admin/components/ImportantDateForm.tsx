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
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImportantDate } from "@/types/importantDate";
import { Label } from "@/components/ui/label";

type NotificationType = "success" | "error" | "none";

export default function ImportantDateForm() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [displayText, setDisplayText] = useState("");
    const [isExtended, setIsExtended] = useState(false);
    const [originalDate, setOriginalDate] = useState("");
    const [originalDisplayText, setOriginalDisplayText] = useState("");
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

    // 處理日期輸入並自動生成顯示文字
    const handleDateChange = (value: string) => {
        setDate(value);

        if (value) {
            try {
                // 將 YYYY-MM-DD 轉換為本地顯示格式
                const dateObj = new Date(value + "T00:00:00");
                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = dateObj.getMonth() + 1;
                    const day = dateObj.getDate();
                    setDisplayText(`${year}年${month}月${day}日`);
                }
            } catch (e) {
                // 忽略錯誤，保持現有的顯示文字
            }
        }
    };

    // 同樣處理原始日期
    const handleOriginalDateChange = (value: string) => {
        setOriginalDate(value);

        if (value) {
            try {
                const dateObj = new Date(value + "T00:00:00");
                if (!isNaN(dateObj.getTime())) {
                    const year = dateObj.getFullYear();
                    const month = dateObj.getMonth() + 1;
                    const day = dateObj.getDate();
                    setOriginalDisplayText(`${year}年${month}月${day}日`);
                }
            } catch (e) {
                // 忽略錯誤
            }
        }
    };

    // 提交表單
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 清除之前的通知
        setNotification({ type: "none", title: "", message: "" });

        // 輸入驗證
        if (!title.trim()) {
            showNotification("error", "標題錯誤", "請輸入標題");
            return;
        }

        if (!date.trim()) {
            showNotification("error", "日期錯誤", "請選擇日期");
            return;
        }

        if (!displayText.trim()) {
            showNotification("error", "顯示文字錯誤", "請輸入顯示文字");
            return;
        }

        if (isExtended && !originalDate.trim()) {
            showNotification("error", "原始日期錯誤", "若為延長日期，請輸入原始日期");
            return;
        }

        try {
            setIsSubmitting(true);

            const importantDateData: ImportantDate = {
                title: title.trim(),
                date,
                displayText: displayText.trim(),
                isExtended,
                ...(isExtended && {
                    originalDate,
                    originalDisplayText: originalDisplayText.trim(),
                }),
            };

            const response = await fetch("/api/admin/importantDate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(importantDateData),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification("success", "新增成功", "重要日期已成功新增到系統");

                // 重置表單
                setTitle("");
                setDate("");
                setDisplayText("");
                setIsExtended(false);
                setOriginalDate("");
                setOriginalDisplayText("");
            } else {
                showNotification("error", "新增失敗", data.error || "新增重要日期時出現錯誤");
            }
        } catch (error) {
            showNotification("error", "系統錯誤", "無法連接到伺服器，請稍後再試");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>新增重要日期</CardTitle>
                    <CardDescription>設定會議相關的重要時程，將顯示在網站首頁</CardDescription>
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
                        <Label htmlFor="title">標題</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例如：論文摘要投稿截止日"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 日期輸入 */}
                    <div className="space-y-2">
                        <Label htmlFor="date">日期</Label>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* 顯示文字 */}
                    <div className="space-y-2">
                        <Label htmlFor="displayText">顯示文字</Label>
                        <Input
                            id="displayText"
                            value={displayText}
                            onChange={(e) => setDisplayText(e.target.value)}
                            placeholder="例如：2025年5月1日"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                            系統會根據選擇的日期自動生成，您也可以手動修改顯示格式
                        </p>
                    </div>

                    {/* 是否為延長日期 */}
                    <div className="flex items-start space-x-2 pt-2">
                        <Checkbox
                            id="isExtended"
                            checked={isExtended}
                            onCheckedChange={(checked) => setIsExtended(checked === true)}
                        />
                        <div className="grid gap-1">
                            <Label
                                htmlFor="isExtended"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                此日期為延期後的新日期
                            </Label>
                            <p className="text-xs text-gray-500">若勾選此項，請填寫原始日期資訊</p>
                        </div>
                    </div>

                    {/* 延長日期相關欄位 */}
                    {isExtended && (
                        <div className="space-y-4 border-l-2 border-gray-200 pl-4 pt-2">
                            {/* 原始日期 */}
                            <div className="space-y-2">
                                <Label htmlFor="originalDate">原始日期</Label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <Input
                                        id="originalDate"
                                        type="date"
                                        value={originalDate}
                                        onChange={(e) => handleOriginalDateChange(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* 原始顯示文字 */}
                            <div className="space-y-2">
                                <Label htmlFor="originalDisplayText">原始顯示文字</Label>
                                <Input
                                    id="originalDisplayText"
                                    value={originalDisplayText}
                                    onChange={(e) => setOriginalDisplayText(e.target.value)}
                                    placeholder="例如：2025年4月15日"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}

                    {/* 預覽區域 */}
                    <div className="mt-6 border rounded-md p-4 bg-muted/50">
                        <h4 className="font-medium mb-2">預覽</h4>
                        <div className="p-3 bg-background rounded border">
                            <p className="font-semibold text-xl">
                                {title || "(無標題)"}：
                                {isExtended && originalDisplayText && (
                                    <span className="line-through text-gray-500 ml-1">
                                        {originalDisplayText}
                                    </span>
                                )}
                                {!isExtended && (
                                    <span className="ml-1 text-red-600 font-bold">
                                        {displayText || "(未設定)"}
                                    </span>
                                )}
                            </p>
                            {isExtended && (
                                <p className="text-red-600 font-bold text-xl">
                                    延長至{displayText || "(未設定)"}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                新增中...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                新增重要日期
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
