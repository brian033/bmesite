"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react"; // 添加重整圖標

interface AnalyticItem {
    topic: string;
    total: number;
    full_paper_invitation: {
        oral: number;
        poster: number;
        undecided: number;
    };
    still_in_abstract: {
        oral: number;
        poster: number;
        undecided: number;
    };
}

interface StatsData {
    analytics: AnalyticItem[];
    submissionCount: number;
}
export default function SubmissionStats() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [refreshing, setRefreshing] = useState(false); // 新增: 用於追蹤是否正在重整

    // 提取數據獲取邏輯為單獨的函數，方便重用
    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/reviewer/whole_site_stat");

            if (!res.ok) {
                throw new Error(`請求失敗: ${res.status}`);
            }

            const data = await res.json();
            setStatsData(data);
            setError(null); // 成功後清除任何先前的錯誤
        } catch (err) {
            console.error("獲取統計數據失敗:", err);
            setError(err instanceof Error ? err.message : "未知錯誤");
        } finally {
            setLoading(false);
            setRefreshing(false); // 重整完成
        }
    };

    // 初始加載數據
    useEffect(() => {
        fetchStats();
    }, []);

    // 處理重新整理按鈕點擊
    const handleRefresh = () => {
        if (refreshing) return; // 防止重複請求
        setRefreshing(true);
        fetchStats();
    };

    if (loading && !refreshing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>載入統計資料中...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-500">載入失敗</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!statsData) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        審稿統計
                        <Badge variant="outline" className="ml-2 bg-blue-50">
                            總提交數: {statsData.submissionCount}
                        </Badge>
                    </CardTitle>
                    <CardDescription>依主題和發表形式分類的審稿統計</CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "更新中..." : "重新整理"}
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">總覽</TabsTrigger>
                        <TabsTrigger value="full_paper">全文投稿</TabsTrigger>
                        <TabsTrigger value="abstracts">摘要階段</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Table>
                            <TableCaption>審稿案按主題分類統計</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">主題</TableHead>
                                    <TableHead className="text-center">總數</TableHead>
                                    <TableHead className="text-center">口頭報告</TableHead>
                                    <TableHead className="text-center">海報展示</TableHead>
                                    <TableHead className="text-center">未決定</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statsData.analytics.map((item) => (
                                    <TableRow key={item.topic}>
                                        <TableCell className="font-medium">
                                            {item.topic === "ALL" ? "總計" : item.topic}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{item.total}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.still_in_abstract.oral +
                                                item.full_paper_invitation.oral}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.still_in_abstract.poster +
                                                item.full_paper_invitation.poster}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.still_in_abstract.undecided +
                                                item.full_paper_invitation.undecided}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="full_paper">
                        <Table>
                            <TableCaption>全文投稿統計</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">主題</TableHead>
                                    <TableHead className="text-center">口頭報告</TableHead>
                                    <TableHead className="text-center">海報展示</TableHead>
                                    <TableHead className="text-center">未決定</TableHead>
                                    <TableHead className="text-center">小計</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statsData.analytics.map((item) => {
                                    const total =
                                        item.full_paper_invitation.oral +
                                        item.full_paper_invitation.poster +
                                        item.full_paper_invitation.undecided;

                                    return (
                                        <TableRow key={item.topic}>
                                            <TableCell className="font-medium">
                                                {item.topic === "ALL" ? "總計" : item.topic}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.full_paper_invitation.oral}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.full_paper_invitation.poster}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.full_paper_invitation.undecided}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={total > 0 ? "default" : "outline"}>
                                                    {total}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="abstracts">
                        <Table>
                            <TableCaption>摘要階段統計</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">主題</TableHead>
                                    <TableHead className="text-center">口頭報告</TableHead>
                                    <TableHead className="text-center">海報展示</TableHead>
                                    <TableHead className="text-center">未決定</TableHead>
                                    <TableHead className="text-center">小計</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statsData.analytics.map((item) => {
                                    const total =
                                        item.still_in_abstract.oral +
                                        item.still_in_abstract.poster +
                                        item.still_in_abstract.undecided;

                                    return (
                                        <TableRow key={item.topic}>
                                            <TableCell className="font-medium">
                                                {item.topic === "ALL" ? "總計" : item.topic}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.still_in_abstract.oral}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.still_in_abstract.poster}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.still_in_abstract.undecided}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={total > 0 ? "default" : "outline"}>
                                                    {total}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
