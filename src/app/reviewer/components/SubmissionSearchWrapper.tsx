"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import SubmissionReviewCard2 from "./SubmissionReviewCard2";
import SubmissionReviewCard3 from "./SubmissionReviewCard3";
import { SubmissionWithDetailedInfo } from "../page";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getSerial } from "@/app/profile/components/SubmissionCard";

interface SubmissionSearchWrapperProps {
    submissions: SubmissionWithDetailedInfo[];
}

interface EnhancedSubmission extends SubmissionWithDetailedInfo {
    serialNumber: string;
}

const default_filters = {
    status: {
        pending: false,
        accepted: false,
        rejected: false,
        replied: false,
        waiting: false,
    },
    type: {
        abstracts: false,
        full_paper: false,
    },
    payment: {
        paid: false,
        unpaid: false,
    },
};

export default function SubmissionSearchWrapper({ submissions }: SubmissionSearchWrapperProps) {
    // 先為所有提交計算序列號
    const enhancedSubmissions = useMemo(() => {
        return submissions.map((submission) => {
            const serialNumber = getSerial(
                submission.submissionPresentType,
                submission.submissionTopic,
                submission.submissionId
            );

            return {
                ...submission,
                serialNumber, // 將計算好的 serial 添加到提交對象中
            };
        });
    }, [submissions]);

    // 從 localStorage 讀取過濾條件，如果不存在則設置預設值
    const getStoredFilters = () => {
        if (typeof window === "undefined") return null;

        try {
            // 嘗試從 localStorage 讀取
            const storedFilters = localStorage.getItem("reviewerSubmissionFilters");

            // 如果已存在，直接解析並返回
            if (storedFilters) {
                return JSON.parse(storedFilters);
            }

            // 將預設值存入 localStorage
            localStorage.setItem("reviewerSubmissionFilters", JSON.stringify(default_filters));

            // 返回預設值
            return default_filters;
        } catch (error) {
            console.error("Failed to parse stored filters:", error);
            return null;
        }
    };

    // 從 localStorage 中讀取搜索詞
    const getStoredSearchTerm = () => {
        if (typeof window === "undefined") return "";
        try {
            return localStorage.getItem("reviewerSubmissionSearch") || "";
        } catch (error) {
            return "";
        }
    };

    // 保存過濾條件和搜索詞到 localStorage
    const saveToStorage = (newFilters: any, newSearchTerm: string) => {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem("reviewerSubmissionFilters", JSON.stringify(newFilters));
            localStorage.setItem("reviewerSubmissionSearch", newSearchTerm);
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    };

    const [searchTerm, setSearchTerm] = useState(() => getStoredSearchTerm());
    const [filteredSubmissions, setFilteredSubmissions] =
        useState<EnhancedSubmission[]>(enhancedSubmissions);

    // 使用 localStorage 中的過濾條件或默認值
    const [filters, setFilters] = useState(() => {
        const storedFilters = getStoredFilters() || default_filters;
        return storedFilters;
    });

    const [isFiltering, setIsFiltering] = useState(false);

    // 更新搜索詞並保存到 localStorage
    const updateSearchTerm = (newTerm: string) => {
        setSearchTerm(newTerm);
        saveToStorage(filters, newTerm);
    };

    // 更新過濾條件並保存到 localStorage
    const updateFilters = (newFilters: any) => {
        setFilters(newFilters);
        saveToStorage(newFilters, searchTerm);
    };

    // 當搜尋詞或過濾條件改變時更新顯示的提交
    useEffect(() => {
        const filterSubmissions = () => {
            return enhancedSubmissions.filter((submission) => {
                // 搜尋詞過濾 (現在包括序列號)
                const searchMatch =
                    searchTerm === "" ||
                    submission.submissionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    submission.submissionOwner.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    submission.submissionTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    submission.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()); // 添加序列號搜尋

                // 狀態過濾
                // 狀態過濾 - 只有勾選的狀態才會顯示
                const statusValuesSelected = Object.values(filters.status).some((value) => value);
                const statusMatch =
                    !statusValuesSelected || // 如果沒有選擇任何狀態，顯示全部
                    filters.status[submission.submissionStatus]; // 否則只顯示被勾選的狀態

                // 類型過濾 - 只有勾選的類型才會顯示
                const typeValuesSelected = Object.values(filters.type).some((value) => value);
                const typeMatch =
                    !typeValuesSelected || // 如果沒有選擇任何類型，顯示全部
                    filters.type[submission.submissionType]; // 否則只顯示被勾選的類型

                // 付款狀態過濾 - 只有勾選的付款狀態才會顯示
                const paymentSelected = filters.payment.paid || filters.payment.unpaid;
                const paymentMatch =
                    !paymentSelected || // 如果沒有選擇任何付款狀態，顯示全部
                    (filters.payment.paid && submission.submissionOwner.payment?.paid) || // 已付款且勾選了已付款
                    (filters.payment.unpaid && !submission.submissionOwner.payment?.paid); // 未付款且勾選了未付款

                return searchMatch && statusMatch && typeMatch && paymentMatch; // 加入 paymentMatch
            });
        };

        setFilteredSubmissions(filterSubmissions());
        setIsFiltering(
            searchTerm !== "" ||
                !Object.values(filters.status).every((v) => v) ||
                !Object.values(filters.type).every((v) => v) ||
                filters.payment.paid ||
                filters.payment.unpaid // 添加付款狀態過濾的判斷
        );
    }, [searchTerm, filters, enhancedSubmissions]);

    // 切換過濾條件
    const toggleFilter = (category: "status" | "type" | "payment", key: string) => {
        const newFilters = {
            ...filters,
            [category]: {
                ...filters[category],
                [key]: !filters[category][key],
            },
        };
        updateFilters(newFilters);
    };

    // 清空過濾條件
    const clearFilters = () => {
        updateFilters(default_filters);
        updateSearchTerm("");
    };

    // 計算待審審稿案數量
    const pendingCount = enhancedSubmissions.filter((s) => s.submissionStatus === "pending").length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                {/* 搜尋和過濾頭部 */}
                <div className="flex flex-col md:flex-row gap-2">
                    {/* 搜尋框 */}
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="搜尋標題、投稿者、主題或編號..."
                            value={searchTerm}
                            onChange={(e) => updateSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => updateSearchTerm("")}
                                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* 過濾菜單 */}
                    <div className="flex gap-2 justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex gap-1 items-center">
                                    <Filter className="h-4 w-4" />
                                    <span>過濾</span>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>審稿狀態</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                    checked={filters.status.pending}
                                    onCheckedChange={() => toggleFilter("status", "pending")}
                                >
                                    待審核
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.status.accepted}
                                    onCheckedChange={() => toggleFilter("status", "accepted")}
                                >
                                    已接受
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.status.rejected}
                                    onCheckedChange={() => toggleFilter("status", "rejected")}
                                >
                                    已拒絕
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.status.replied}
                                    onCheckedChange={() => toggleFilter("status", "replied")}
                                >
                                    退回修改
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.status.waiting}
                                    onCheckedChange={() => toggleFilter("status", "waiting")}
                                >
                                    等待全文
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuLabel>審稿案類型</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                    checked={filters.type.abstracts}
                                    onCheckedChange={() => toggleFilter("type", "abstracts")}
                                >
                                    摘要
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.type.full_paper}
                                    onCheckedChange={() => toggleFilter("type", "full_paper")}
                                >
                                    全文
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />

                                <DropdownMenuLabel>付款狀態</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                    checked={filters.payment.paid}
                                    onCheckedChange={() => toggleFilter("payment", "paid")}
                                >
                                    已付款
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.payment.unpaid}
                                    onCheckedChange={() => toggleFilter("payment", "unpaid")}
                                >
                                    未付款
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isFiltering && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="text-gray-500"
                            >
                                清除過濾
                            </Button>
                        )}
                    </div>
                </div>

                {/* 過濾狀態顯示 */}
                <div className="flex flex-wrap gap-2 items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                        顯示 {filteredSubmissions.length} 個審稿案{" "}
                        {enhancedSubmissions.length > 0 && `(共 ${enhancedSubmissions.length} 個)`}
                    </span>

                    {pendingCount > 0 && (
                        <Badge className="bg-red-500 text-white">{pendingCount} 個待審核</Badge>
                    )}

                    {isFiltering && (
                        <div className="flex flex-wrap gap-1">
                            {searchTerm && (
                                <Badge variant="outline" className="flex gap-1 items-center">
                                    搜尋: {searchTerm}
                                    <X
                                        className="h-3 w-3 cursor-pointer"
                                        onClick={() => updateSearchTerm("")}
                                    />
                                </Badge>
                            )}

                            {Object.entries(filters.status).some(([_, value]) => value) && (
                                <Badge variant="outline" className="flex gap-1 items-center">
                                    已過濾狀態
                                </Badge>
                            )}
                            {(filters.payment.paid || filters.payment.unpaid) && (
                                <Badge variant="outline" className="flex gap-1 items-center">
                                    已過濾付款狀態
                                </Badge>
                            )}

                            {Object.entries(filters.type).some(([_, value]) => value) && (
                                <Badge variant="outline" className="flex gap-1 items-center">
                                    已過濾類型
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 顯示過濾後的審稿案 */}
            {filteredSubmissions.length > 0 ? (
                <div className="flex flex-col gap-4 mx-1">
                    {/* {filteredSubmissions.map((submission) => (
                        <SubmissionReviewCard2
                            key={submission.submissionId}
                            submission={submission}
                        />
                    ))} */}
                    <SubmissionReviewCard3 submissions={filteredSubmissions} />
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md border mx-1">
                    <div className="text-gray-500">未找到審稿案</div>
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                        清除所有過濾條件
                    </Button>
                </div>
            )}
        </div>
    );
}
