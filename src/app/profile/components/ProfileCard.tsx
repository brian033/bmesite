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
                <EditableField
                    api_value="name"
                    label="姓名與職稱 Name and Title"
                    value={user.name}
                />
                <EditableField
                    mandatory={true}
                    api_value="contact_email"
                    label="收信信箱 Contact Email"
                    value={user.contact_email}
                />

                <EditableField
                    mandatory={true}
                    api_value="department"
                    label="所屬單位 Affiliation"
                    value={user.department}
                />
                <EditableField api_value="phone" label="聯絡電話 Phone" value={user.phone} />
                <EditableRadioField
                    api_value="dietary"
                    label="飲食偏好 dietary preferences"
                    value={user.dietary === "new" ? "未選擇" : user.dietary}
                    options={[
                        { value: "vegan", label: "素食 vegan" },
                        { value: "non_vegan", label: "葷食 non vegan" },
                    ]}
                    mandatory
                />
                <EditableRadioField
                    api_value="going_dinner"
                    label="參加晚宴 going dinner"
                    value={
                        typeof user.going_dinner === "boolean"
                            ? user.going_dinner
                                ? "yes"
                                : "no"
                            : "未選擇"
                    }
                    options={[
                        { value: "yes", label: "參加 yes" },
                        { value: "no", label: "不參加 no" },
                    ]}
                    mandatory
                />

                <div className="flex items-center justify-between gap-x-4">
                    <span className="font-medium whitespace-nowrap">身份別 role:</span>
                    <span className="text-sm text-gray-800">
                        {user.role === "admin"
                            ? "管理員 admin"
                            : user.role === "reviewer"
                            ? "審稿者 reviewer"
                            : "與會者 attendee"}
                        {user.registered ? " (已填寫資料)" : " (請填寫資料)"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-x-4">
                    <span className="font-medium whitespace-nowrap">付款狀態 payment status:</span>
                    {user.payment.paid ? (
                        <Badge className="bg-green-500">已付款 Paid</Badge>
                    ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            未付款 Not Paid
                        </Badge>
                    )}
                </div>
                <EditableRadioField
                    api_value="privacy_consent"
                    label="同意個資使用 Privacy Consent"
                    value={
                        typeof user.privacy_consent === "boolean"
                            ? user.privacy_consent
                                ? "yes"
                                : "no"
                            : "未選擇"
                    }
                    options={[
                        { value: "yes", label: "同意 agree" },
                        { value: "no", label: "不同意 disagree" },
                    ]}
                    mandatory
                />
                {!user.privacy_consent || user.privacy_consent === "new" ? (
                    <div className="border rounded-md p-3 mb-2">
                        <p className="text-sm font-medium mb-2">隱私權政策 Privacy policy</p>
                        <div className="h-32 overflow-y-auto text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                                euismod, nisl eget ultricies tincidunt, nunc nisl aliquam nisl, eget
                                aliquam nisl nisl eget nisl. Donec euismod, nisl eget ultricies
                                tincidunt, nunc nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
                            </p>
                            <p className="mt-2">
                                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                                quae ab illo inventore veritatis et quasi architecto beatae vitae
                                dicta sunt explicabo.
                            </p>
                            <p className="mt-2">
                                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
                                fugit, sed quia consequuntur magni dolores eos qui ratione
                                voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
                                ipsum quia dolor sit amet, consectetur, adipisci velit.
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            請在上方選擇是否同意此隱私權政策
                        </p>
                    </div>
                ) : null}
                {user.payment.paid && (
                    <div className="border-t pt-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                <span>Sign in QR Code</span>
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
