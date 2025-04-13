"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type User = {
    name: string;
    email: string;
    uuid: string;
    role: string;
    createdAt: string;
    phone: string;
    address: string;
    department: string;
    payment: {
        paid: boolean;
        payment_id: string;
    };
    uploaded_pdfs: {
        abstracts: { pdf: string; uploadedAt: string; pdfId: string }[];
        final_paper: { pdf: string; uploadedAt: string; pdfId: string }[];
        poster: { pdf: string; uploadedAt: string; pdfId: string }[];
        others: { pdf: string; uploadedAt: string; pdfId: string }[];
    };
};

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
    const { data: session } = useSession();
    const [users, setUsers] = useState(initialUsers);

    const handleRoleChange = async (email: string, newRole: string) => {
        const res = await fetch("/api/admin/set_role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newRole }),
        });

        if (res.ok) {
            setUsers((prev) =>
                prev.map((user) => (user.email === email ? { ...user, role: newRole } : user))
            );
        } else {
            alert("更新角色失敗");
        }
    };

    return (
        <div style={tableContainerStyle}>
            <table style={tableStyle} border={1} cellPadding={8}>
                <thead>
                    <tr style={trStyle}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>頭貼</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Address</th>
                        <th style={thStyle}>Department</th>
                        <th style={thStyle}>Payment</th>
                        <th style={thStyle}>UUID</th>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.uuid} style={trStyle}>
                            <td style={tdStyle}>{user.name}</td>
                            <td style={tdStyle}>
                                <img
                                    src={
                                        user.image?.startsWith("/pfp")
                                            ? `/api/user_uploads${user.image}`
                                            : user.image
                                    }
                                    alt="頭貼"
                                    width={50}
                                    height={50}
                                    style={{ borderRadius: "999px", objectFit: "cover" }}
                                />
                            </td>
                            <td style={tdStyle}>{user.email}</td>
                            <td style={tdStyle}>{user.phone}</td>
                            <td style={tdStyle}>{user.address}</td>
                            <td style={tdStyle}>{user.department}</td>
                            <td style={tdStyle}>
                                {user.payment.paid ? "已付款" : "未付款"} (ID:{" "}
                                {user.payment.payment_id})
                            </td>
                            <td style={tdStyle}>{user.uuid}</td>
                            <td style={tdStyle}>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                    disabled={session?.user?.email === user.email}
                                    style={selectStyle}
                                >
                                    <option value="attendee">attendee</option>
                                    <option value="reviewer">reviewer</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>
                            <td style={tdStyle}>{new Date(user.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// CSS Styles
const tableContainerStyle = {
    overflowX: "auto", // 讓表格可以左右滾動
    margin: "20px 0",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto", // 使表格寬度自動調整
};

const trStyle = {
    borderBottom: "1px solid #ddd",
};

const thStyle = {
    padding: "12px 8px",
    textAlign: "left",
    backgroundColor: "black",
    fontWeight: "bold",
};

const tdStyle = {
    padding: "8px",
    textAlign: "left",
    border: "1px solid #ddd",
};

const selectStyle = {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    color: "black",
    cursor: "pointer",
};
