"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import EditableField from "./EditableField";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProfileCard() {
    const { data: session, status } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    if (status === "loading") return <p>載入中...</p>;
    if (!session || !session.user) return <p>未登入</p>;

    const user = session.user as {
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
                <img
                    src={imageSrc}
                    alt="頭貼"
                    width={160}
                    height={160}
                    className="rounded-full object-cover mx-auto"
                />
                <Button
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    className="mt-4"
                    disabled={uploading}
                >
                    {uploading ? "上傳中..." : "換頭貼"}
                </Button>
                <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex flex-col gap-4 flex-grow">
                <EditableField
                    api_value="contact_email"
                    label="聯絡用Email"
                    value={user.contact_email}
                />
                <EditableField api_value="name" label="姓名" value={user.name} />
                <EditableField api_value="phone" label="聯絡電話" value={user.phone} />
                <EditableField api_value="department" label="單位" value={user.department} />

                <div className="flex justify-between text-sm">
                    <span>付款狀態:</span>
                    <span>
                        {user.payment?.paid
                            ? `已付款, 付款編號: ${user.payment.payment_id}`
                            : "未付款"}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span>身份別:</span>
                    <span>
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
