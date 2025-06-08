"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EditableRadioFieldProps {
    api_value: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    mandatory?: boolean;
}

const EditableRadioField = ({
    api_value,
    label,
    value,
    options,
    mandatory,
}: EditableRadioFieldProps) => {
    const [editing, setEditing] = useState(false);
    const [newValue, setNewValue] = useState(value);

    const isMissing = mandatory && (newValue === "未選擇" || newValue.includes("未輸入"));

    const handleEditClick = () => setEditing(true);
    const handleCancel = () => {
        setEditing(false);
        setNewValue(value);
    };

    const handleValueChange = (value: string) => {
        setNewValue(value);
    };

    const handleSubmit = async () => {
        const fieldToUpdate = api_value.toLowerCase();
        const updatedField = { [fieldToUpdate]: newValue };

        const res = await fetch("/api/attendee/update_profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedField),
        });

        if (res.ok) {
            const data = await res.json();
            setEditing(false);
            if (data.updatedUser.reload) {
                alert("感謝您填寫資料，頁面重新整理後您將可以開始使用完整功能!");
                window.location.reload();
            }
        } else {
            alert("更新失敗");
        }
    };

    // 找到目前值對應的標籤文字
    const getCurrentLabel = () => {
        const option = options.find((opt) => opt.value === newValue);
        return option ? option.label : newValue;
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <label className="font-medium whitespace-nowrap">{label}:</label>
            {editing ? (
                <div className="flex flex-row items-center ml-auto">
                    {/* 使用 ml-auto 推到最右邊 */}
                    <RadioGroup
                        value={newValue}
                        onValueChange={handleValueChange}
                        className="flex flex-row space-y-1"
                    >
                        {options.map((option) => (
                            <div key={option.value} className="flex items-center mx-2">
                                <RadioGroupItem
                                    value={option.value}
                                    id={`${api_value}-${option.value}`}
                                />
                                <Label htmlFor={`${api_value}-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <div className="flex justify-end gap-2 ml-2">
                        {" "}
                        {/* 使用 justify-end 讓按鈕靠右 */}
                        <Button
                            className="cursor-pointer"
                            onClick={handleSubmit}
                            variant="default"
                            size="sm"
                        >
                            送出
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={handleCancel}
                            variant="destructive"
                            size="sm"
                        >
                            取消
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 ml-auto">
                    {" "}
                    {/* 同樣使用 ml-auto */}
                    <span
                        className={`text-sm ${
                            isMissing ? "text-red-600 font-semibold" : "text-gray-800"
                        }`}
                    >
                        {getCurrentLabel()}
                    </span>
                    <Button
                        className="cursor-pointer"
                        onClick={handleEditClick}
                        variant="outline"
                        size="sm"
                    >
                        編輯
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EditableRadioField;
