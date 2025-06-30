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
                <EditableField api_value="name" label="姓名與職稱(製作名牌用)" value={user.name} />
                <EditableField
                    mandatory={true}
                    api_value="contact_email"
                    label="聯絡用Email"
                    value={user.contact_email}
                />

                <EditableField
                    mandatory={true}
                    api_value="department"
                    label="所屬單位(製作名牌用)"
                    value={user.department}
                />
                <EditableField api_value="phone" label="聯絡電話" value={user.phone} />
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
                <EditableRadioField
                    api_value="privacy_consent"
                    label="同意個資使用(選擇後不能更改)"
                    value={
                        typeof user.privacy_consent === "boolean"
                            ? user.privacy_consent
                                ? "yes"
                                : "no"
                            : "未選擇"
                    }
                    options={[
                        { value: "yes", label: "同意" },
                        { value: "no", label: "不同意" },
                    ]}
                    mandatory
                />
                {!user.privacy_consent || user.privacy_consent === "new" ? (
                    <div className="border rounded-md p-3 mb-2">
                        <p className="text-sm font-medium mb-2">隱私權政策</p>
                        <div className="h-32 overflow-y-auto text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <p>蒐集個人資料告知事項暨個人資料提供同意書</p>
                            <p className="mt-2">
                                台灣生物機電學會為遵守個人資料保護法令及個人資料保護政策、規章，於向您蒐集個人資料前，依法向您告知下列事項，敬請詳閱。
                                您瞭解此一同意書符合個人資料保護法及相關法規之要求，且同意台灣生物機電學會留存此同意書，供日後取出查驗。
                            </p>
                            <p className="mt-2">一、蒐集目的及類別</p>
                            <p className="mt-2">
                                台灣生物機電學會因主辦 2025
                                年生機與農機學術研討會之業務、活動、計畫、提供服務及供台灣生物機電學會用於內部行政管理、陳報主管機關或其他合於台灣生物機電學會組織規章定業務、寄送台灣生物機電學會相關活動訊息之蒐集目的，而需獲取您下列個人資料類別：姓名、職稱、所屬單位、連絡電話、電子郵件、飲食偏好。
                            </p>
                            <p className="mt-2">二、個人資料利用之期間及方式</p>
                            <p className="mt-2">
                                個人資料蒐集至 114 年 10 月 31
                                日並得以書面及電子等形式處理或利用。搜集之個人資料將於 114 年 11 月
                                01 日自台灣生物機電學會之網頁及資料庫中刪除。
                            </p>
                            <p className="mt-2">三、當事人權利</p>
                            <p className="mt-2">
                                您可依前述業務、活動所定規則或依聯絡電子信箱{" "}
                                <a
                                    href="mailto:beame2025.conf@gmail.com"
                                    className="text-blue-600 hover:underline"
                                >
                                    beame2025.conf@gmail.com
                                </a>{" "}
                                向台灣生物機電學會行使下列權利：(一) 查詢或請求閱覽、(二)
                                請求補充或更正、(三) 請求停止蒐集、處理及利用、(四)
                                請求刪除您的個人資料
                            </p>
                            <p className="mt-2">四、不提供個人資料之權益影響</p>
                            <p className="mt-2">
                                若您未提供正確或不提供個人資料，台灣生物機電學會得拒絕為您提供蒐集目的之相關服務。
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
