"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/user";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserDetailCard from "./UserDetailCard";

export default function UserTable({
    db_user,
    db_documents,
    db_submissions,
}: {
    db_user: User[];
    db_documents: Document[];
    db_submissions: Submission[];
}) {
    const { data: session } = useSession();
    const [users, setUsers] = useState(db_user);

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
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>頭貼</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>電話</TableHead>
                        <TableHead>單位</TableHead>
                        <TableHead>付款</TableHead>
                        <TableHead>UUID</TableHead>
                        <TableHead>身份</TableHead>
                        <TableHead>建立時間</TableHead>
                        <TableHead>詳細資料</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.uuid}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={
                                            typeof user.image === "string" &&
                                            user.image.startsWith("/pfp")
                                                ? `/api/user_uploads${user.image}`
                                                : user.image ?? "/default-profile.png"
                                        }
                                    />
                                    <AvatarFallback>👤</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                                {user.payment?.paid ? (
                                    <Badge variant="default">已付款</Badge>
                                ) : (
                                    <Badge variant="destructive">未付款</Badge>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    ID: {user.payment?.payment_id ?? "None"}
                                </div>
                            </TableCell>
                            <TableCell className="text-xs">{user.uuid}</TableCell>
                            <TableCell>
                                <Select
                                    defaultValue={user.role}
                                    onValueChange={(val) => handleRoleChange(user.email, val)}
                                    disabled={session?.user?.email === user.email}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="角色" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="attendee">與會者</SelectItem>
                                        <SelectItem value="reviewer">審稿者</SelectItem>
                                        <SelectItem value="admin">管理員</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <UserDetailCard
                                    user={user}
                                    documents={db_documents}
                                    submissions={db_submissions}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
