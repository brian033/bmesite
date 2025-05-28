"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface AnnouncementData {
    _id: string;
    title: string;
    lines: string[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
}

// 簡單的連結處理函數，尋找格式為 [文字](連結) 的部分
function processLinks(text: string) {
    // 尋找形如 [文字](連結) 的模式
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // 如果沒有匹配到連結，直接返回原文本
    if (!text.match(linkRegex)) {
        return text;
    }

    // 將文本分割成連結和非連結部分
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // 添加連結前的文本
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // 添加連結元素
        const [, linkText, linkHref] = match;
        const isExternal = !linkHref.startsWith("/");

        parts.push(
            <Link
                href={linkHref}
                key={match.index}
                className="text-blue-600 hover:underline"
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noopener noreferrer" : ""}
            >
                {linkText}
            </Link>
        );

        lastIndex = match.index + match[0].length;
    }

    // 添加最後剩餘的文本
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
}

export default function AnnouncementCard() {
    const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/info/announcement");

                if (!response.ok) {
                    throw new Error(`獲取公告失敗: ${response.statusText}`);
                }

                const data = await response.json();
                setAnnouncements(data);
                setError(null);
            } catch (err) {
                console.error("獲取公告時發生錯誤:", err);
                setError("無法獲取最新公告，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();

        // 設置定時器，每10分鐘重新獲取一次數據
        const intervalId = setInterval(fetchAnnouncements, 10 * 60 * 1000);

        // 清理函數
        return () => clearInterval(intervalId);
    }, []);

    // 處理加載狀態
    if (loading) {
        return (
            <Card className="w-full mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl flex items-center">
                        <BellRing className="mr-2 h-6 w-6" />
                        最新公告
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-gray-500">
                    正在獲取公告...
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
                        <BellRing className="mr-2 h-6 w-6" />
                        最新公告
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-red-500">{error}</CardContent>
            </Card>
        );
    }

    // 如果沒有公告，顯示提示訊息
    if (announcements.length === 0) {
        return (
            <Card className="w-full mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-2xl flex items-center">
                        <BellRing className="mr-2 h-6 w-6" />
                        最新公告
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-center py-8 text-gray-500">
                    目前沒有公告
                </CardContent>
            </Card>
        );
    }

    // 有公告時，顯示所有公告內容
    return (
        <Card className="w-full mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl flex items-center">
                    <BellRing className="mr-2 h-6 w-6" />
                    最新公告
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-6">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement._id.toString()}
                            className="border-l-4 border-green-600 pl-4 py-1"
                        >
                            <h3 className="font-semibold text-xl text-gray-800 mb-3">
                                {announcement.title}
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                                {announcement.lines.map((line, index) => (
                                    <li key={index} className="text-gray-700">
                                        {processLinks(line)}
                                    </li>
                                ))}
                            </ul>
                            {announcement.createdAt && (
                                <p className="text-sm text-gray-500 mt-3">
                                    發布日期: {formatDate(announcement.createdAt)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// 格式化日期的輔助函數
function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
