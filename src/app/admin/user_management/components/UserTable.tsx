"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/user";
import { Payment } from "@/types/payment";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    SearchIcon,
    Link2,
    ExternalLink,
    ChevronDown,
    UserIcon,
    CreditCardIcon,
    UtensilsIcon,
    CalendarIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";
import { formatToUTC8 } from "@/lib/formatToUTC8";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function UserTable({
    db_user,
    db_submissions,
    db_payments,
}: {
    db_user: User[];
    db_submissions: Submission[];
    db_payments: Payment[];
}) {
    const { data: session } = useSession();
    const [users, setUsers] = useState(db_user);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(db_user);
    const [filters, setFilters] = useState({
        role: {
            attendee: false,
            reviewer: false,
            admin: false,
        },
        payment: {
            paid: false,
            unpaid: false,
        },
        dietary: {
            vegan: false,
            non_vegan: false,
            new: false,
        },
        dinner: {
            going: false,
            not_going: false,
            undecided: false,
        },
    });

    const [isSettingWhitelist, setIsSettingWhitelist] = useState(false);
    const [whitelistUser, setWhitelistUser] = useState<User | null>(null);
    const [whitelistSettings, setWhitelistSettings] = useState({
        oral: false,
        poster: false,
        undecided: false,
    });
    const [whitelistMessage, setWhitelistMessage] = useState<{
        status: "success" | "error";
        message: string;
    } | null>(null);

    // 格式化飲食偏好顯示
    const formatDietary = (dietary: string) => {
        switch (dietary) {
            case "vegan":
                return "素";
            case "non_vegan":
                return "葷";
            case "new":
            default:
                return "未選擇";
        }
    };

    // 格式化晚宴參加意願顯示
    const formatDinner = (going_dinner: boolean | string) => {
        if (going_dinner === true) return "會去";
        if (going_dinner === false) return "不會去";
        return "未選擇";
    };

    const openWhitelistDialog = (user: User) => {
        setWhitelistUser(user);
        setWhitelistMessage(null);

        // 初始化勾選狀態 - 根據用戶現有的白名單設置
        const currentWhitelist = Array.isArray(user.reviewing_whitelist)
            ? user.reviewing_whitelist
            : [];

        setWhitelistSettings({
            oral: currentWhitelist.includes("oral"),
            poster: currentWhitelist.includes("poster"),
            undecided: currentWhitelist.includes("undecided"),
        });
    };

    // 新增: 提交白名單設定
    const submitWhitelistSettings = async () => {
        if (!whitelistUser) return;

        setIsSettingWhitelist(true);
        setWhitelistMessage(null);

        try {
            const response = await fetch("/api/admin/set_reviewer_whitelist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: whitelistUser.email,
                    whitelist: whitelistSettings,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "設定審稿白名單失敗");
            }

            // 更新本地用戶數據
            const updatedUsers = users.map((user) => {
                if (user.email === whitelistUser.email) {
                    return {
                        ...user,
                        reviewing_whitelist: data.whitelist,
                    };
                }
                return user;
            });

            setUsers(updatedUsers);
            setFilteredUsers(
                filteredUsers.map((user) => {
                    if (user.email === whitelistUser.email) {
                        return {
                            ...user,
                            reviewing_whitelist: data.whitelist,
                        };
                    }
                    return user;
                })
            );

            setWhitelistMessage({
                status: "success",
                message: `已更新 ${whitelistUser.name || whitelistUser.email} 的審稿白名單`,
            });

            // 3秒後自動關閉對話框
            setTimeout(() => {
                if (whitelistUser) {
                    setWhitelistUser(null);
                }
            }, 3000);
        } catch (error) {
            console.error(error);
            setWhitelistMessage({
                status: "error",
                message: error.message || "設定審稿白名單失敗",
            });
        } finally {
            setIsSettingWhitelist(false);
        }
    };

    // 增強的 CSV 導出函數，添加 BOM 標記以支持中文
    const exportToCSV = () => {
        // 定義 CSV 標頭行
        const headers = [
            "姓名",
            "聯絡Email",
            "電話",
            "單位",
            "付款狀態",
            "已付金額",
            "審稿案數量",
            "帳號類型",
            "飲食偏好",
            "參加晚宴",
            "UUID",
            "建立時間",
        ];

        // 處理可能包含逗號的字段，確保正確轉義
        const formatCSVField = (field: string) => {
            if (field === null || field === undefined) return "";
            const stringField = String(field);
            // 如果字段包含逗號、引號或換行符，需要用引號包裹並轉義引號
            if (
                stringField.includes(",") ||
                stringField.includes('"') ||
                stringField.includes("\n")
            ) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        // 映射用戶數據到 CSV 行
        const csvData = filteredUsers.map((user) => {
            const { payments, totalPaid } = getUserPayments(user.uuid);
            const userSubmissions = getUserSubmissions(user.uuid);

            // 格式化付款狀態
            const paymentStatus = user.payment?.paid ? "已付款" : "未付款";

            // 創建行數據，確保正確格式化
            return [
                formatCSVField(user.name || ""),
                formatCSVField(user.contact_email || ""),
                formatCSVField(user.phone || ""),
                formatCSVField(user.department || ""),
                formatCSVField(paymentStatus),
                formatCSVField(totalPaid.toString()),
                formatCSVField(userSubmissions.length.toString()),
                formatCSVField(user.role || ""),
                formatCSVField(formatDietary(user.dietary)),
                formatCSVField(formatDinner(user.going_dinner)),
                formatCSVField(user.uuid || ""),
                formatCSVField(formatToUTC8(user.createdAt)),
            ];
        });

        // 添加 BOM 標記，確保 Excel 正確識別中文編碼
        const BOM = "\uFEFF";
        const csvContent =
            BOM +
            [headers.map(formatCSVField).join(","), ...csvData.map((row) => row.join(","))].join(
                "\n"
            );

        // 創建下載鏈接
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `使用者資料_${formatToUTC8(new Date()).slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 釋放 URL 對象
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    };

    // 搜尋和過濾功能
    useEffect(() => {
        const results = db_user.filter((user) => {
            // 搜尋詞過濾
            const searchMatch =
                !searchTerm ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.uuid?.includes(searchTerm);

            // 角色過濾
            const roleValuesSelected = Object.values(filters.role).some((value) => value);
            const roleMatch = !roleValuesSelected || filters.role[user.role];

            // 付款狀態過濾
            const paymentSelected = filters.payment.paid || filters.payment.unpaid;
            const paymentMatch =
                !paymentSelected ||
                (filters.payment.paid && user.payment?.paid) ||
                (filters.payment.unpaid && !user.payment?.paid);

            // 飲食偏好過濾
            const dietarySelected = Object.values(filters.dietary).some((value) => value);
            const dietaryMatch =
                !dietarySelected ||
                (filters.dietary.vegan && user.dietary === "vegan") ||
                (filters.dietary.non_vegan && user.dietary === "non_vegan") ||
                (filters.dietary.new && (user.dietary === "new" || !user.dietary));

            // 晚宴參加意願過濾
            const dinnerSelected = Object.values(filters.dinner).some((value) => value);
            const dinnerMatch =
                !dinnerSelected ||
                (filters.dinner.going && user.going_dinner === true) ||
                (filters.dinner.not_going && user.going_dinner === false) ||
                (filters.dinner.undecided &&
                    (user.going_dinner === "new" ||
                        user.going_dinner === undefined ||
                        user.going_dinner === null));

            return searchMatch && roleMatch && paymentMatch && dietaryMatch && dinnerMatch;
        });

        setFilteredUsers(results);
    }, [searchTerm, filters, db_user]);

    // 獲取用戶的投稿列表
    const getUserSubmissions = (userId: string) => {
        return db_submissions.filter((submission) => submission.submissionOwner === userId);
    };

    // 獲取用戶的付款列表和總金額
    const getUserPayments = (userId: string) => {
        const userPayments = db_payments.filter((payment) => payment.paymentOwner === userId);

        const totalPaidAmount = userPayments
            .filter((payment) => payment.paymentStatus === "paid")
            .reduce((sum, payment) => sum + payment.paymentValue, 0);

        return { payments: userPayments, totalPaid: totalPaidAmount };
    };

    // 角色更新
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
            // 也更新過濾後的用戶列表
            setFilteredUsers((prev) =>
                prev.map((user) => (user.email === email ? { ...user, role: newRole } : user))
            );
        } else {
            alert("更新角色失敗");
        }
    };

    const formatPaymentData = (user: User) => {
        const { payments, totalPaid } = getUserPayments(user.uuid);

        // 對付款記錄進行排序：已付款 > 未付款 > 失敗，同類型中按時間倒序（最新的在前）
        const sortedPayments = [...payments].sort((a, b) => {
            // 首先按狀態排序
            const statusOrder = { paid: 0, created: 1, failed: 2 };
            const statusDiff = statusOrder[a.paymentStatus] - statusOrder[b.paymentStatus];

            return statusDiff;
        });

        return (
            <div className="space-y-2">
                {/* 付款狀態 */}
                {user.payment?.paid ? (
                    <Badge className="bg-green-500">已付款</Badge>
                ) : (
                    <Badge variant="destructive">未付款</Badge>
                )}

                {/* 已付金額 */}
                {totalPaid > 0 && (
                    <div className="text-sm font-medium">
                        總付款金額: <span className="text-green-600">${totalPaid}</span>
                    </div>
                )}

                {/* 付款記錄列表 */}
                {sortedPayments.length > 0 && (
                    <div className="mt-2">
                        <details className="text-xs">
                            <summary className="cursor-pointer text-blue-500 font-medium">
                                查看付款記錄 ({sortedPayments.length})
                            </summary>
                            <div className="mt-2 space-y-2">
                                {sortedPayments.map((payment) => (
                                    <div
                                        key={payment.paymentId}
                                        className={`p-2 rounded text-xs ${
                                            payment.paymentStatus === "paid"
                                                ? "bg-green-50 border border-green-100"
                                                : payment.paymentStatus === "failed"
                                                ? "bg-red-50 border border-red-100"
                                                : "bg-gray-50 border border-gray-100"
                                        }`}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">訂單編號:</span>
                                            <span className="font-mono">
                                                {typeof payment.paymentParams === "object" &&
                                                payment.paymentParams?.MerchantTradeNo
                                                    ? payment.paymentParams.MerchantTradeNo
                                                    : "人工輸入付款"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">狀態:</span>
                                            <span>
                                                {payment.paymentStatus === "paid" && "已付款"}
                                                {payment.paymentStatus === "failed" && "失敗"}
                                                {payment.paymentStatus === "created" && "未付款"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">金額:</span>
                                            <span>${payment.paymentValue}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">類型:</span>
                                            <span>{payment.paymentType}</span>
                                        </div>

                                        {/* ECPay 回應 - 已重命名 */}
                                        {payment.ecpayResponse && (
                                            <details className="mt-1">
                                                <summary className="cursor-pointer text-xs text-blue-500">
                                                    綠界api回應內容
                                                </summary>
                                                <pre className="mt-1 p-1 bg-gray-50 rounded overflow-x-auto text-[10px] whitespace-pre-wrap">
                                                    {JSON.stringify(payment.ecpayResponse, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* 搜尋和過濾區塊 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="搜尋姓名、Email、電話、單位或UUID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {/* 角色過濾 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        角色
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.role.attendee}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                role: { ...filters.role, attendee: checked },
                                            })
                                        }
                                    >
                                        與會者
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.role.reviewer}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                role: { ...filters.role, reviewer: checked },
                                            })
                                        }
                                    >
                                        審稿者
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.role.admin}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                role: { ...filters.role, admin: checked },
                                            })
                                        }
                                    >
                                        管理員
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 付款狀態過濾 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex gap-2">
                                        <CreditCardIcon className="h-4 w-4" />
                                        付款狀態
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.payment.paid}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                payment: { ...filters.payment, paid: checked },
                                            })
                                        }
                                    >
                                        已付款
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.payment.unpaid}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                payment: { ...filters.payment, unpaid: checked },
                                            })
                                        }
                                    >
                                        未付款
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 飲食偏好過濾 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex gap-2">
                                        <UtensilsIcon className="h-4 w-4" />
                                        飲食偏好
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dietary.vegan}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dietary: { ...filters.dietary, vegan: checked },
                                            })
                                        }
                                    >
                                        素食
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dietary.non_vegan}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dietary: { ...filters.dietary, non_vegan: checked },
                                            })
                                        }
                                    >
                                        葷食
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dietary.new}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dietary: { ...filters.dietary, new: checked },
                                            })
                                        }
                                    >
                                        未選擇
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 晚宴參加意願過濾 */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        參加晚宴
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dinner.going}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dinner: { ...filters.dinner, going: checked },
                                            })
                                        }
                                    >
                                        會去
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dinner.not_going}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dinner: { ...filters.dinner, not_going: checked },
                                            })
                                        }
                                    >
                                        不會去
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.dinner.undecided}
                                        onCheckedChange={(checked) =>
                                            setFilters({
                                                ...filters,
                                                dinner: { ...filters.dinner, undecided: checked },
                                            })
                                        }
                                    >
                                        未選擇
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 下載CSV按鈕 */}
                            <Button
                                onClick={exportToCSV}
                                variant="outline"
                                className="flex gap-2"
                                disabled={filteredUsers.length === 0}
                            >
                                <DownloadIcon className="h-4 w-4" />
                                匯出
                            </Button>
                            {/* 重置過濾器 */}
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilters({
                                        role: { attendee: false, reviewer: false, admin: false },
                                        payment: { paid: false, unpaid: false },
                                        dietary: { vegan: false, non_vegan: false, new: false },
                                        dinner: {
                                            going: false,
                                            not_going: false,
                                            undecided: false,
                                        },
                                    });
                                }}
                            >
                                重置
                            </Button>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                        顯示 {filteredUsers.length} 筆結果，共 {db_user.length} 位使用者
                    </div>
                </CardContent>
            </Card>

            {/* 使用者表格 */}
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>姓名</TableHead>
                            <TableHead>頭貼</TableHead>
                            <TableHead>聯絡Email</TableHead>
                            <TableHead>電話</TableHead>
                            <TableHead>單位</TableHead>
                            <TableHead className="min-w-[200px]">付款狀態</TableHead>
                            <TableHead>審稿案</TableHead>
                            <TableHead>身份</TableHead>
                            <TableHead>飲食偏好</TableHead>
                            <TableHead>參加晚宴</TableHead>
                            <TableHead>UUID</TableHead>
                            <TableHead>建立時間</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => {
                            const userSubmissions = getUserSubmissions(user.uuid);
                            return (
                                <TableRow key={user.uuid}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    typeof user.image === "string" &&
                                                    user.image.startsWith("/pfp")
                                                        ? `/api/user_uploads${user.image}`
                                                        : user.image ?? "/default-profile.png"
                                                }
                                                alt={user.name || "使用者頭像"}
                                            />
                                            <AvatarFallback>
                                                {user.name
                                                    ? user.name.charAt(0).toUpperCase()
                                                    : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>{user.contact_email}</TableCell>
                                    <TableCell>{user.phone || "未設定"}</TableCell>
                                    <TableCell>{user.department || "未設定"}</TableCell>
                                    <TableCell>{formatPaymentData(user)}</TableCell>
                                    {/* // 修改審稿案列表部分 */}
                                    <TableCell>
                                        {userSubmissions.length > 0 ? (
                                            <div className="space-y-2">
                                                <details className="group">
                                                    <summary className="cursor-pointer flex items-center gap-2">
                                                        <Badge className="bg-blue-500">
                                                            {userSubmissions.length} 個審稿案
                                                        </Badge>
                                                        <span className="text-xs text-blue-600 group-open:hidden">
                                                            點擊展開
                                                        </span>
                                                        <span className="text-xs text-blue-600 hidden group-open:inline">
                                                            收起
                                                        </span>
                                                    </summary>

                                                    <div className="mt-2 space-y-1 pl-1 border-l-2 border-blue-100">
                                                        {userSubmissions.map((submission) => (
                                                            <Button
                                                                key={submission.submissionId}
                                                                onClick={() => {
                                                                    const submissionParam =
                                                                        JSON.stringify([
                                                                            submission.submissionId,
                                                                        ]);
                                                                    const url = `/reviewer?submissions=${encodeURIComponent(
                                                                        submissionParam
                                                                    )}`;
                                                                    window.open(url, "_blank");
                                                                }}
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex gap-1 w-full justify-start text-xs h-7"
                                                            >
                                                                <Link2 className="h-3 w-3" />
                                                                <span className="truncate max-w-[150px]">
                                                                    {submission.submissionTitle ||
                                                                        submission.submissionId}
                                                                </span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </details>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">無審稿案</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={(val) =>
                                                handleRoleChange(user.email, val)
                                            }
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
                                        {/* 審稿白名單按鈕 */}
                                        {(user.role === "reviewer" || user.role === "admin") && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openWhitelistDialog(user)}
                                                className="w-full text-xs"
                                            >
                                                設定審稿白名單
                                                {user.reviewing_whitelist &&
                                                    Array.isArray(user.reviewing_whitelist) &&
                                                    user.reviewing_whitelist.length > 0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-1 px-1 text-xs"
                                                        >
                                                            {user.reviewing_whitelist.length}
                                                        </Badge>
                                                    )}
                                            </Button>
                                        )}

                                        {/* 顯示當前審稿權限 */}
                                        {user.reviewing_whitelist &&
                                            Array.isArray(user.reviewing_whitelist) &&
                                            user.reviewing_whitelist.length > 0 && (
                                                <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                                                    {user.reviewing_whitelist.includes("oral") && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 h-4"
                                                        >
                                                            口頭
                                                        </Badge>
                                                    )}
                                                    {user.reviewing_whitelist.includes(
                                                        "poster"
                                                    ) && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 h-4"
                                                        >
                                                            海報
                                                        </Badge>
                                                    )}
                                                    {user.reviewing_whitelist.includes(
                                                        "undecided"
                                                    ) && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 h-4"
                                                        >
                                                            未定
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {formatDietary(user.dietary)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {formatDinner(user.going_dinner)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{user.uuid}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatToUTC8(user.createdAt)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* 無結果顯示 */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-10">
                    <p>沒有符合條件的使用者</p>
                </div>
            )}
            {/* 審稿白名單設定對話框 */}
            <Dialog open={!!whitelistUser} onOpenChange={(open) => !open && setWhitelistUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>設定審稿白名單</DialogTitle>
                        <DialogDescription>
                            選擇 {whitelistUser?.name || whitelistUser?.email} 可以審閱的投稿類型。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="oral-checkbox"
                                    checked={whitelistSettings.oral}
                                    onCheckedChange={(checked) =>
                                        setWhitelistSettings((prev) => ({
                                            ...prev,
                                            oral: !!checked,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="oral-checkbox"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    口頭報告 (Oral)
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="poster-checkbox"
                                    checked={whitelistSettings.poster}
                                    onCheckedChange={(checked) =>
                                        setWhitelistSettings((prev) => ({
                                            ...prev,
                                            poster: !!checked,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="poster-checkbox"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    海報展示 (Poster)
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="undecided-checkbox"
                                    checked={whitelistSettings.undecided}
                                    onCheckedChange={(checked) =>
                                        setWhitelistSettings((prev) => ({
                                            ...prev,
                                            undecided: !!checked,
                                        }))
                                    }
                                />
                                <label
                                    htmlFor="undecided-checkbox"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    未決定
                                </label>
                            </div>
                        </div>

                        {/* 提示信息 */}
                        <p className="text-sm text-muted-foreground">
                            至少選擇一項審稿類型。用戶將只能審閱所選類型的投稿。
                        </p>

                        {/* 回饋訊息 */}
                        {whitelistMessage && (
                            <div
                                className={`p-3 rounded-md ${
                                    whitelistMessage.status === "success"
                                        ? "bg-green-50 border border-green-200 text-green-800"
                                        : "bg-red-50 border border-red-200 text-red-800"
                                }`}
                            >
                                {whitelistMessage.message}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setWhitelistUser(null)}
                            disabled={isSettingWhitelist}
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={submitWhitelistSettings}
                            disabled={
                                isSettingWhitelist ||
                                (!whitelistSettings.oral &&
                                    !whitelistSettings.poster &&
                                    !whitelistSettings.undecided)
                            }
                        >
                            {isSettingWhitelist ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    儲存中...
                                </>
                            ) : (
                                "儲存設定"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
