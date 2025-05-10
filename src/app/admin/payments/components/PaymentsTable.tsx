"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw } from "lucide-react";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PaymentTableItem {
    paymentId: string;
    createdAt: Date;
    paymentStatus: "created" | "paid" | "failed";
    paymentValue: number;
    paymentType: string;
    userId: string;
    userName: string;
    userEmail: string;
    userDepartment: string;
    user: User | null;
}

interface PaymentsTableProps {
    payments: PaymentTableItem[];
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingOrderStatus, setLoadingOrderStatus] = useState<string | null>(null);
    const [ecpayResponse, setEcpayResponse] = useState<any>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    const handleViewUser = (user: User | null) => {
        if (user) {
            setSelectedUser(user);
            setIsDialogOpen(true);
        }
    };

    // 查詢綠界訂單狀態
    const checkOrderStatus = async (paymentId: string) => {
        try {
            setLoadingOrderStatus(paymentId);
            const response = await fetch(
                `/api/payment/get-order-status?MerchantTradeNo=${paymentId}`
            );

            if (!response.ok) {
                throw new Error(`查詢失敗: ${response.status}`);
            }

            const data = await response.json();
            setEcpayResponse(data);
            setIsStatusDialogOpen(true);
            console.log("綠界API回應:", data);
            toast.success("綠界訂單狀態查詢成功");
        } catch (error) {
            console.error("查詢綠界訂單狀態時出錯:", error);
            toast.error(`查詢失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
        } finally {
            setLoadingOrderStatus(null);
        }
    };

    // 過濾支付記錄
    const filteredPayments = payments.filter((payment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            payment.paymentId.toLowerCase().includes(searchLower) ||
            payment.userName.toLowerCase().includes(searchLower) ||
            payment.userEmail.toLowerCase().includes(searchLower) ||
            payment.userDepartment.toLowerCase().includes(searchLower) ||
            payment.paymentStatus.toLowerCase().includes(searchLower)
        );
    });

    // 渲染支付狀態徽章
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500">已支付</Badge>;
            case "created":
                return <Badge className="bg-yellow-500">處理中</Badge>;
            case "failed":
                return <Badge variant="destructive">失敗</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // 格式化日期
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            <div className="p-4 border-b">
                <div className="flex items-center">
                    <Input
                        placeholder="搜尋支付記錄..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <div className="ml-2 text-sm text-gray-500">
                        共 {filteredPayments.length} 筆記錄
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">支付 ID</TableHead>
                            <TableHead>建立日期</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead>金額</TableHead>
                            <TableHead>支付類型</TableHead>
                            <TableHead>用戶名</TableHead>
                            <TableHead>用戶部門</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                    沒有找到支付記錄
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((payment) => (
                                <TableRow key={payment.paymentId}>
                                    <TableCell className="font-mono text-xs">
                                        {payment.paymentId}
                                    </TableCell>
                                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                    <TableCell>
                                        {renderStatusBadge(payment.paymentStatus)}
                                    </TableCell>
                                    <TableCell>NT$ {payment.paymentValue}</TableCell>
                                    <TableCell>{payment.paymentType}</TableCell>
                                    <TableCell>
                                        <div>{payment.userName}</div>
                                        <div className="text-xs text-gray-500">
                                            {payment.userEmail}
                                        </div>
                                    </TableCell>
                                    <TableCell>{payment.userDepartment}</TableCell>
                                    <TableCell className="space-y-1">
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewUser(payment.user)}
                                                disabled={!payment.user}
                                            >
                                                <Search className="w-4 h-4 mr-1" />
                                                查看用戶
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => checkOrderStatus(payment.paymentId)}
                                                disabled={loadingOrderStatus === payment.paymentId}
                                            >
                                                {loadingOrderStatus === payment.paymentId ? (
                                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="w-4 h-4 mr-1" />
                                                )}
                                                使用綠界API查詢
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 用戶詳細信息對話框 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>用戶詳細信息</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid grid-cols-2 gap-4">{/* 現有的用戶對話框內容 */}</div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 綠界訂單狀態對話框 */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>綠界訂單狀態查詢</DialogTitle>
                    </DialogHeader>
                    {ecpayResponse && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 mb-4">
                                <Badge className="mb-2">綠界API回應</Badge>
                                <div className="bg-gray-50 p-3 rounded border text-sm overflow-x-auto">
                                    {ecpayResponse.success && ecpayResponse.order && (
                                        <>
                                            <div className="flex py-1 border-b border-gray-100">
                                                <span className="font-mono font-medium w-48">
                                                    處理結果:
                                                </span>
                                                <span className="font-mono">
                                                    {ecpayResponse.success ? "成功" : "失敗"}
                                                </span>
                                            </div>
                                            {Object.entries(ecpayResponse.order).map(
                                                ([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex py-1 border-b border-gray-100"
                                                    >
                                                        <span className="font-mono font-medium w-48">
                                                            {key}:
                                                        </span>
                                                        <span className="font-mono">
                                                            {typeof value === "object"
                                                                ? JSON.stringify(value)
                                                                : String(value)}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 交易狀態解釋 */}
                            {ecpayResponse.order && ecpayResponse.order.TradeStatus && (
                                <div className="col-span-2 mt-2">
                                    <h4 className="font-medium mb-2">交易狀態說明</h4>
                                    <div className="p-3 rounded border">
                                        <div className="flex items-center">
                                            <span className="font-medium mr-2">狀態代碼:</span>
                                            <span className="font-mono">
                                                {ecpayResponse.order.TradeStatus}
                                            </span>
                                            <span className="ml-4">
                                                {ecpayResponse.order.TradeStatus === "1" ? (
                                                    <Badge className="bg-green-500">成功</Badge>
                                                ) : ecpayResponse.order.TradeStatus === "0" ? (
                                                    <Badge variant="outline">待付款</Badge>
                                                ) : (
                                                    <Badge variant="destructive">失敗</Badge>
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="font-medium">狀態說明:</span>
                                            <span className="ml-2">
                                                {ecpayResponse.order.TradeStatus === "1"
                                                    ? "付款成功"
                                                    : ecpayResponse.order.TradeStatus === "0"
                                                    ? "等待付款中"
                                                    : ecpayResponse.order.RtnMsg || "付款失敗"}
                                            </span>
                                        </div>
                                        {ecpayResponse.order.PaymentDate && (
                                            <div className="mt-2">
                                                <span className="font-medium">付款時間:</span>
                                                <span className="ml-2 font-mono">
                                                    {ecpayResponse.order.PaymentDate}
                                                </span>
                                            </div>
                                        )}
                                        {ecpayResponse.order.TradeAmt && (
                                            <div className="mt-2">
                                                <span className="font-medium">交易金額:</span>
                                                <span className="ml-2 font-mono">
                                                    NT$ {ecpayResponse.order.TradeAmt}
                                                </span>
                                            </div>
                                        )}
                                        {ecpayResponse.order.isPaid !== undefined && (
                                            <div className="mt-4 pt-2 border-t">
                                                <span className="font-medium">系統記錄狀態:</span>
                                                <span className="ml-2">
                                                    {ecpayResponse.order.isPaid ? (
                                                        <Badge className="bg-green-500">
                                                            已標記為付款
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">未標記付款</Badge>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
