"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportantDate } from "@/types/importantDate";

export default function ImportantDatesCard() {
    const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImportantDates = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/info/importantDate");

                if (!response.ok) {
                    throw new Error(`獲取重要日期失敗: ${response.statusText}`);
                }

                const data = await response.json();
                setImportantDates(data);
                setError(null);
            } catch (err) {
                console.error("獲取重要日期時發生錯誤:", err);
                setError("無法獲取重要日期資訊，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };

        fetchImportantDates();

        // 設置定時器，每小時重新獲取一次數據
        const intervalId = setInterval(fetchImportantDates, 60 * 60 * 1000);

        // 清理函數
        return () => clearInterval(intervalId);
    }, []);

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

    // 處理加載狀態
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

    // 處理錯誤狀態
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

    // 如果沒有重要日期，顯示提示訊息
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

    // 有重要日期時，顯示所有內容
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
                            <div key={index}>
                                <p className="font-semibold text-2xl">
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
