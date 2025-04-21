"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
    api_value: string;
    label: string;
    value: string;
    mandatory?: boolean;
}

const EditableField = ({ api_value, label, value, mandatory }: EditableFieldProps) => {
    const [editing, setEditing] = useState(false);
    const [newValue, setNewValue] = useState(value);

    const isMissing = mandatory && newValue.includes("未輸入");

    const handleEditClick = () => setEditing(true);
    const handleCancel = () => {
        setEditing(false);
        setNewValue(value);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewValue(e.target.value);
    };

    const handleSubmit = async () => {
        const fieldToUpdate = api_value.toLowerCase();
        const updatedField = { [fieldToUpdate]: newValue };

        // 如果是 contact_email，就驗證格式
        if (fieldToUpdate === "contact_email") {
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRegex.test(newValue)) {
                alert("請輸入有效的 Email 格式，例如 example@domain.com");
                return;
            }
        }
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

    return (
        <div className="flex items-center justify-between gap-4">
            <label className="font-medium whitespace-nowrap">{label}:</label>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Input
                        value={newValue}
                        onChange={handleValueChange}
                        className={`max-w-xs ${isMissing ? "border-red-500" : ""}`}
                    />
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
            ) : (
                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm ${
                            isMissing ? "text-red-600 font-semibold" : "text-gray-800"
                        }`}
                    >
                        {newValue}
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

export default EditableField;
