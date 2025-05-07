"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmissionWithDetailedInfo } from "../page";

interface SubmissionStatusChangerProps {
    submission: SubmissionWithDetailedInfo;
    onStatusChange?: (updatedSubmission?: SubmissionWithDetailedInfo) => void;
}

// 所有可能的提交狀態
const STATUS_OPTIONS = ["pending", "accepted", "rejected", "replied", "waiting"];
const TYPE_OPTIONS = ["abstracts", "full_paper"];

// 狀態顯示名稱對應
const STATUS_DISPLAY = {
    pending: "待審核",
    accepted: "接受",
    rejected: "拒絕",
    replied: "退回修改", // 已修正為"退回修改"
    waiting: "等待全文",
};

export function SubmissionStatusChanger({
    submission,
    onStatusChange,
}: SubmissionStatusChangerProps) {
    const { data: session } = useSession();
    const [submissionType, setSubmissionType] = useState(submission.submissionType);
    const [submissionStatus, setSubmissionStatus] = useState(submission.submissionStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null
    );
    const [availableActions, setAvailableActions] = useState<
        Array<{
            label: string;
            type: string;
            status: string;
            color: string;
        }>
    >([]);

    // 更新狀態當提交數據變化時
    useEffect(() => {
        setSubmissionType(submission.submissionType);
        setSubmissionStatus(submission.submissionStatus);
    }, [submission.submissionType, submission.submissionStatus]);

    // 用戶角色
    const isAdmin = session?.user?.role === "admin";

    // 根據當前狀態和類型設定審稿者可用的操作
    useEffect(() => {
        if (!session || isAdmin) return;

        const actions = [];
        const currentType = submission.submissionType;
        const currentStatus = submission.submissionStatus;

        if (currentType === "abstracts" && currentStatus === "pending") {
            actions.push(
                {
                    label: "退回修改",
                    type: "abstracts",
                    status: "replied",
                    color: "bg-orange-600 hover:bg-orange-700 text-white",
                },
                {
                    label: "拒絕",
                    type: "abstracts",
                    status: "rejected",
                    color: "bg-red-600 hover:bg-red-700 text-white",
                },
                {
                    label: "邀請投稿全文",
                    type: "full_paper",
                    status: "waiting",
                    color: "bg-blue-600 hover:bg-blue-700 text-white",
                }
            );
        } else if (currentType === "full_paper" && currentStatus === "pending") {
            actions.push(
                {
                    label: "接受全文",
                    type: "full_paper",
                    status: "approved",
                    color: "bg-green-600 hover:bg-green-700 text-white",
                },
                {
                    label: "退回修改",
                    type: "full_paper",
                    status: "replied",
                    color: "bg-orange-600 hover:bg-orange-700 text-white",
                },
                {
                    label: "拒絕",
                    type: "full_paper",
                    status: "rejected",
                    color: "bg-red-600 hover:bg-red-700 text-white",
                }
            );
        }

        setAvailableActions(actions);
    }, [submission, session, isAdmin]);

    const handleUpdate = async (type?: string, status?: string) => {
        // 如果是透過按鈕觸發，使用提供的參數
        const updateType = type || submissionType;
        const updateStatus = status || submissionStatus;

        if (
            updateType === submission.submissionType &&
            updateStatus === submission.submissionStatus
        ) {
            setMessage({ type: "error", text: "沒有變更任何狀態" });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        setIsUpdating(true);
        setMessage(null);

        try {
            const response = await fetch("/api/reviewer/modify_submission_status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submissionId: submission.submissionId,
                    updates: {
                        submissionType: updateType,
                        submissionStatus: updateStatus,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "更新狀態失敗");
            }

            // 更新本地狀態
            setSubmissionType(updateType as "abstracts" | "full_paper");
            setSubmissionStatus(
                updateStatus as "pending" | "approved" | "rejected" | "replied" | "waiting"
            );

            // 從 API 響應獲取更新後的提交數據
            if (data.success && data.submission) {
                // 通知父組件狀態和數據已變更
                if (onStatusChange) {
                    // 將更新後的提交數據傳遞給父組件
                    onStatusChange(data.submission);
                }

                // 成功消息中添加狀態變更信息
                setMessage({
                    type: "success",
                    text: `審稿案狀態已更新為 ${STATUS_DISPLAY[updateStatus]}`,
                });
            } else {
                setMessage({ type: "success", text: "審稿案狀態已成功更新" });
            }

            // 5秒後清除消息
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error("更新狀態時出錯:", error);
            setMessage({ type: "error", text: error.message || "更新失敗" });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsUpdating(false);
        }
    };

    // 管理員界面 - 可以選擇任意狀態
    const renderAdminInterface = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="submissionType">提交類型</Label>
                    <Select
                        value={submissionType}
                        onValueChange={(value) =>
                            setSubmissionType(value as "abstracts" | "full_paper")
                        }
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="選擇提交類型" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="abstracts">摘要</SelectItem>
                            <SelectItem value="full_paper">全文</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="submissionStatus">提交狀態</Label>
                    <Select
                        value={submissionStatus}
                        onValueChange={(value) =>
                            setSubmissionStatus(
                                value as "pending" | "rejected" | "replied" | "waiting" | "approved"
                            )
                        }
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="選擇提交狀態" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {STATUS_DISPLAY[option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={() => handleUpdate()}
                    variant="default"
                    size="sm"
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            更新中...
                        </>
                    ) : (
                        "更新審稿狀態"
                    )}
                </Button>
            </div>
        </div>
    );

    // 審稿者界面 - 根據當前狀態顯示可用按鈕
    const renderReviewerInterface = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-muted-foreground">目前提交類型</div>
                    <div className="font-medium">
                        {submission.submissionType === "abstracts" ? "摘要" : "全文"}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">目前狀態</div>
                    <div className="font-medium">
                        {STATUS_DISPLAY[submission.submissionStatus] || submission.submissionStatus}
                    </div>
                </div>
            </div>

            {availableActions.length > 0 ? (
                <div className="space-y-2 pt-2">
                    <div className="text-sm font-medium">可執行的操作：</div>
                    <div className="flex flex-wrap gap-2">
                        {availableActions.map((action, index) => (
                            <Button
                                key={index}
                                onClick={() => handleUpdate(action.type, action.status)}
                                disabled={isUpdating}
                                className={action.color}
                                size="sm"
                            >
                                {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground italic pt-2">
                    當前狀態下無可執行的操作
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">審稿案狀態管理</h3>
            </div>

            {isAdmin ? renderAdminInterface() : renderReviewerInterface()}

            {message && (
                <div
                    className={`flex items-center gap-2 p-2 rounded ${
                        message.type === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                    }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}
        </div>
    );
}
