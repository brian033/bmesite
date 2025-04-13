"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import EditableField from "./EditableField";
import Image from "next/image";

export default function ProfileCard() {
    const { data: session, status } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // react states to handle form data
    if (status === "loading") return <p>載入中...</p>;
    if (!session || !session.user) return <p>未登入</p>;

    const user = session.user;
    const imageSrc = user.image?.startsWith("/pfp") ? `/api/user_uploads${user.image}` : user.image;

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
            // reload
            window.location.reload();
        } else {
            alert("上傳失敗");
        }
        setUploading(false);
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "2rem",
                padding: "1.5rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                maxWidth: "800px",
                flexDirection: "row",
            }}
        >
            <div style={{ textAlign: "center" }}>
                <img
                    src={imageSrc}
                    alt="頭貼"
                    width={160}
                    height={160}
                    style={{ borderRadius: "9999px", objectFit: "cover", display: "block" }}
                />
                <br />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        backgroundColor: "#0070f3",
                        color: "#333",
                        border: "1px solid #888",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: "0.4rem 0.8rem",
                        cursor: "pointer",
                    }}
                >
                    {uploading ? "上傳中..." : "換頭貼"}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    gap: "0.5rem",
                    flexGrow: 1,
                }}
            >
                <span style={lineStyle}>
                    <p>電子郵件: </p> <p>{user.email}</p>
                </span>
                <EditableField api_value="name" label="姓名" value={user.name} />
                <EditableField api_value="phone" label="聯絡電話" value={user.phone} />
                <EditableField api_value="address" label="聯絡地址" value={user.address} />
                <EditableField api_value="department" label="單位" value={user.department} />
                <span style={lineStyle}>
                    <p>付款狀態: </p>
                    <p>
                        {user.payment.paid
                            ? `已付款, 付款編號: ${user.payment.payment_id}`
                            : "未付款"}
                    </p>
                </span>

                <span style={lineStyle}>
                    <p>身份別: </p>
                    <p>
                        {user.role === "admin"
                            ? "管理員"
                            : user.role === "reviewer"
                            ? "審稿者"
                            : "與會者"}
                    </p>
                </span>
            </div>
        </div>
    );
}

const lineStyle = {
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
};
