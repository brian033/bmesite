"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import EditableField from "./EditableField";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileCard() {
    const { data: session, status } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    if (status === "loading") return <p>載入中...</p>;
    if (!session || !session.user) return <p>未登入</p>;

    const user = session.user as unknown as {
        name?: string;
        contact_email?: string;
        image?: string;
        phone?: string;
        address?: string;
        department?: string;
        payment?: { paid: boolean; payment_id?: string };
        role?: string;
        registered?: boolean;
    };

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
            </div>
        </Card>
    );
}
