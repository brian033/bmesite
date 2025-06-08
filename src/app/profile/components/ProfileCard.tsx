"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import EditableField from "./EditableField";
import EditableRadioField from "./EditableRadioField";
import QRCodeGenerator from "./QRCodeGenerator";
import { ChevronDown, ChevronUp, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
export default function ProfileCard() {
    const { data: session, status } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    if (status === "loading") return <p>載入中...</p>;
    if (!session || !session.user) return <p>未登入</p>;

    const user = session.user as User;

    const imageSrc =
        typeof user.image === "string" && user.image.startsWith("/pfp")
            ? `/api/user_uploads${user.image}`
            : user.image ?? "/default-profile.png";

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/attendee/update_pfp", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            window.location.reload();
        } else {
            alert("上傳失敗");
        }
        setUploading(false);
    };

    return (
        <Card className="max-w-4xl mx-auto p-6 flex gap-6">
            <div className="text-center">
                <button
                    className="relative w-48 h-48 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    <Avatar className="w-full h-full">
                        <AvatarImage src={imageSrc} />
                        <AvatarFallback>👤</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                        換頭貼
                    </div>
                </button>
                <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex flex-col gap-4 flex-grow">
                <EditableField api_value="name" label="姓名" value={user.name} />
                <EditableField
                    mandatory={true}
                    api_value="contact_email"
                    label="聯絡用Email"
                    value={user.contact_email}
                />
                <EditableField
                    mandatory={true}
                    api_value="department"
                    label="單位"
                    value={user.department}
                />
                <EditableRadioField
                    api_value="dietary"
                    label="飲食偏好"
                    value={user.dietary === "new" ? "未選擇" : user.dietary}
                    options={[
                        { value: "vegan", label: "素食" },
                        { value: "non_vegan", label: "葷食" },
                    ]}
                    mandatory
                />
                <EditableRadioField
                    api_value="going_dinner"
                    label="參加晚宴"
                    value={
                        typeof user.going_dinner === "boolean"
                            ? user.going_dinner
                                ? "yes"
                                : "no"
                            : "未選擇"
                    }
                    options={[
                        { value: "yes", label: "參加" },
                        { value: "no", label: "不參加" },
                    ]}
                    mandatory
                />
                <EditableField api_value="phone" label="聯絡電話" value={user.phone} />
                <div className="flex items-center justify-between gap-x-4">
                    <span className="font-medium whitespace-nowrap">身份別:</span>
                    <span className="text-sm text-gray-800">
                        {user.role === "admin"
                            ? "管理員"
                            : user.role === "reviewer"
                            ? "審稿者"
                            : "與會者"}
                        {user.registered ? " (已填寫資料)" : " (請更新聯絡用Email/單位)"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-x-4">
                    <span className="font-medium whitespace-nowrap">付款狀態:</span>
                    {user.payment.paid ? (
                        <Badge className="bg-green-500">已付款</Badge>
                    ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            未付款
                        </Badge>
                    )}
                </div>
                {user.payment.paid && (
                    <div className="border-t pt-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                <span>顯示活動當天簽到用QR Code</span>
                            </div>
                            {showQRCode ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>

                        {showQRCode && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                <QRCodeGenerator
                                    uuid={user.uuid}
                                    title="我的專屬 QR Code"
                                    size={200}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
