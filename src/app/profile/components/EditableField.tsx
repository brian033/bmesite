// import { useState } from "react";

// type EditableFieldProps = {
//     api_value: string; // API 中的欄位名稱，例如 "name"、"phone" 等等
//     label: string; // 欄位名稱
//     value: string; // 當前顯示的值
// };

// const EditableField = ({ api_value, label, value }: EditableFieldProps) => {
//     const [editing, setEditing] = useState(false);
//     const [newValue, setNewValue] = useState(value);

//     const handleEditClick = () => {
//         setEditing(true);
//     };

//     const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setNewValue(e.target.value);
//     };

//     const handleSubmit = async () => {
//         // 動態設置要更新的欄位
//         const fieldToUpdate = api_value.toLowerCase(); // 假設 label 是 "name"、"phone" 等等
//         const updatedField = { [fieldToUpdate]: newValue };
//         console.log(updatedField);
//         const res = await fetch("/api/attendee/update_profile", {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(updatedField), // 使用動態欄位
//         });

//         if (res.ok) {
//             const data = await res.json();
//             console.log(`Updated ${fieldToUpdate}:`, data.updatedUser);
//             setEditing(false); // 提交後退出編輯模式
//             if (data.updatedUser.reload) {
//                 alert("感謝您填寫資料，頁面重新整理後您將可以開始使用完整功能!");
//                 window.location.reload(); // 如果需要重新載入頁面
//             }
//         } else {
//             alert("更新失敗");
//         }
//     };

//     const handleCancel = () => {
//         setEditing(false);
//         setNewValue(value); // 取消後恢復原來的值
//     };

//     return (
//         <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <p>{label}: </p>
//             {editing ? (
//                 <div style={{ display: "flex", gap: "1rem" }}>
//                     <input
//                         type="text"
//                         value={newValue}
//                         onChange={handleValueChange}
//                         style={{ padding: "0" }}
//                     />
//                     <button
//                         onClick={handleSubmit}
//                         style={{
//                             backgroundColor: "#4CAF50",
//                             color: "white",
//                             borderRadius: "6px",
//                             marginLeft: "1rem",
//                         }}
//                     >
//                         送出
//                     </button>
//                     <button
//                         onClick={handleCancel}
//                         style={{
//                             backgroundColor: "red",
//                             color: "white",
//                             borderRadius: "6px",
//                             marginLeft: "1rem",
//                         }}
//                     >
//                         取消
//                     </button>
//                 </div>
//             ) : (
//                 <div style={{ display: "flex", alignItems: "center" }}>
//                     <p>{newValue}</p>
//                     <button
//                         onClick={handleEditClick}
//                         style={{
//                             backgroundColor: "cyan",
//                             color: "white",
//                             borderRadius: "6px",
//                             marginLeft: "1rem",
//                         }}
//                     >
//                         編輯
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EditableField;

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
    api_value: string;
    label: string;
    value: string;
}

const EditableField = ({ api_value, label, value }: EditableFieldProps) => {
    const [editing, setEditing] = useState(false);
    const [newValue, setNewValue] = useState(value);

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
                    <Input value={newValue} onChange={handleValueChange} className="max-w-xs" />
                    <Button onClick={handleSubmit} variant="default" size="sm">
                        送出
                    </Button>
                    <Button onClick={handleCancel} variant="destructive" size="sm">
                        取消
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{newValue}</span>
                    <Button onClick={handleEditClick} variant="outline" size="sm">
                        編輯
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EditableField;
