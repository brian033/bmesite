"use client";

import { useState } from "react";
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

interface SubmissionPropertiesChangerProps {
    submissionId: string;
    currentTopic: string;
    currentPresentType: string;
    onPropertiesChange?: (newTopic: string, newPresentType: string) => void;
}

const TOPIC_OPTIONS = [
    "生物產業機械",
    "生物生產工程",
    "畜牧自動化與污染防治",
    "農業設施與環控工程",
    "生物機電控制",
    "生醫工程與微奈米機電",
    "生物資訊與系統",
    "能源與節能技術",
    "AI與大數據分析",
    "精準農業智動化",
    "其他新興科技",
];

export function SubmissionPropertiesChanger({
    submissionId,
    currentTopic,
    currentPresentType,
    onPropertiesChange,
}: SubmissionPropertiesChangerProps) {
    const [editing, setEditing] = useState(false);
    const [topic, setTopic] = useState(currentTopic);
    const [presentType, setPresentType] = useState(currentPresentType);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null
    );

    const handleEditClick = () => {
        setEditing(true);
        setMessage(null);
    };

    const handleCancel = () => {
        setEditing(false);
        setTopic(currentTopic);
        setPresentType(currentPresentType);
        setMessage(null);
    };

    const handleSubmit = async () => {
        if (topic === currentTopic && presentType === currentPresentType) {
            setEditing(false);
            return;
        }

        setIsUpdating(true);
        setMessage(null);

        try {
            const response = await fetch("/api/reviewer/modify_submission_properties", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submissionId,
                    updates: {
                        updatedTopic: topic,
                        updatedPresentType: presentType,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "更新屬性失敗");
            }

            setMessage({ type: "success", text: "提交屬性已成功更新" });
            setEditing(false);

            if (onPropertiesChange) {
                onPropertiesChange(topic, presentType);
            }

            // 5秒後清除消息
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error("更新屬性時出錯:", error);
            setMessage({ type: "error", text: error.message || "更新失敗" });

            // 5秒後清除消息
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">審稿案分類/</h3>
                {!editing ? (
                    <Button onClick={handleEditClick} variant="outline" size="sm">
                        編輯屬性
                    </Button>
                ) : null}
            </div>

            {!editing ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="font-medium whitespace-nowrap min-w-[80px]">主題:</label>
                        <span className="text-sm text-gray-800">{topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="font-medium whitespace-nowrap min-w-[80px]">
                            發表形式:
                        </label>
                        <span className="text-sm text-gray-800">
                            {presentType === "oral" ? "口頭發表 (Oral)" : "海報發表 (Poster)"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic">主題</Label>
                        <Select value={topic} onValueChange={setTopic} disabled={isUpdating}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="選擇主題" />
                            </SelectTrigger>
                            <SelectContent>
                                {TOPIC_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>發表形式</Label>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="oral"
                                    value="oral"
                                    checked={presentType === "oral"}
                                    onChange={() => setPresentType("oral")}
                                    disabled={isUpdating}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="oral" className="cursor-pointer">
                                    口頭發表 (Oral)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="poster"
                                    value="poster"
                                    checked={presentType === "poster"}
                                    onChange={() => setPresentType("poster")}
                                    disabled={isUpdating}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="poster" className="cursor-pointer">
                                    海報發表 (Poster)
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleSubmit}
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
                                "保存變更"
                            )}
                        </Button>
                    </div>
                </div>
            )}

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
