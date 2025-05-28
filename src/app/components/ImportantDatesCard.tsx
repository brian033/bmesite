"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportantDate } from "@/types/importantDate";
import { useSession } from "next-auth/react";

interface ImportantDateWithId extends ImportantDate {
    _id: string;
}

export default function ImportantDatesCard() {
    const [importantDates, setImportantDates] = useState<ImportantDateWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    // 檢查用戶是否為管理員
    const isAdmin =
        !!session?.user &&
        ((Array.isArray((session.user as any).role) &&
            (session.user as any).role.includes("admin")) ||
            (session.user as any).role === "admin");

    const fetchImportantDates = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/info/importantDate");

            if (!response.ok) {
                throw new Error(`獲取重要日期失敗: ${response.statusText}`);
            }

            const data = await response.json();
            // 按日期排序，較早的日期在前面
            const sortedDates = [...data].sort((a, b) => {
                // 將日期字串轉換為 Date 物件，以便比較
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA.getTime() - dateB.getTime(); // 升序排序（較早的日期在前）
            });
            setImportantDates(sortedDates);
            setError(null);
        } catch (err) {
            console.error("獲取重要日期時發生錯誤:", err);
            setError("無法獲取重要日期資訊，請稍後再試。");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImportantDates();

        // 設置定時器，每小時重新獲取一次數據
        const intervalId = setInterval(fetchImportantDates, 60 * 60 * 1000);

        // 清理函數
        return () => clearInterval(intervalId);
    }, []);

    // 處理刪除重要日期
    const handleDelete = async (title: string) => {
        if (confirm(`確定要刪除「${title}」這個重要日期嗎？此操作無法復原。`)) {
            try {
                const response = await fetch("/api/admin/importantDate", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ title }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // 刪除成功後重新載入頁面
                    window.location.reload();
                } else {
                    // 顯示錯誤訊息
                    alert(`刪除失敗: ${result.error || "未知錯誤"}`);
                }
            } catch (err) {
                alert(`刪除操作發生錯誤: ${(err as Error).message}`);
            }
        }
    };

    // 檢查日期是否已過期
    const isDatePassed = (dateStr: string): boolean => {
        const currentDate = new Date();
        const targetDate = new Date(dateStr);

        // 去除時間部分，只比較日期
        const targetDateOnly = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
        );

        const currentDateOnly = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );

        return targetDateOnly < currentDateOnly;
    };

    // 處理加載狀態 (保持不變)
    if (loading) {
        return (
            <Card className="w-full mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl flex items-center">
                        <Calendar className="mr-2 h-6 w-6" />
                        重要時程
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-gray-500">
                    正在獲取資訊...
                </CardContent>
            </Card>
        );
    }

    // 處理錯誤狀態 (保持不變)
    if (error) {
        return (
            <Card className="w-full mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl flex items-center">
                        <Calendar className="mr-2 h-6 w-6" />
                        重要時程
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-red-500">{error}</CardContent>
            </Card>
        );
    }

    // 如果沒有重要日期，顯示提示訊息 (保持不變)
    if (importantDates.length === 0) {
        return (
            <Card className="w-full mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl flex items-center">
                        <Calendar className="mr-2 h-6 w-6" />
                        重要時程
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-gray-500">
                    尚未設定重要時程
                </CardContent>
            </Card>
        );
    }

    // 有重要日期時，顯示所有內容 (添加刪除按鈕)
    return (
        <Card className="w-full mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl flex items-center">
                    <Calendar className="mr-2 h-6 w-6" />
                    重要時程
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-col justify-center">
                    <div className="space-y-5">
                        {importantDates.map((item, index) => (
                            <div key={index} className="relative">
                                {/* 管理員刪除按鈕 */}
                                {isAdmin && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.title)}
                                        className="absolute top-0 right-0 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="刪除重要日期"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}

                                <p className="font-semibold text-2xl pr-10">
                                    {item.title}：
                                    {item.isExtended && item.originalDate ? (
                                        <span className="line-through text-gray-500 ml-1">
                                            {item.originalDisplayText}
                                        </span>
                                    ) : (
                                        <span
                                            className={`ml-1 ${
                                                isDatePassed(item.date)
                                                    ? "text-gray-400"
                                                    : "text-red-600 font-bold"
                                            }`}
                                        >
                                            {item.displayText}
                                        </span>
                                    )}
                                </p>
                                {item.isExtended && (
                                    <p className="text-red-600 font-bold text-2xl">
                                        延長至{item.displayText}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
