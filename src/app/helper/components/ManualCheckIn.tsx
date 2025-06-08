"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, UserCheck, Search, X, AlertCircle } from "lucide-react";
import { formatToUTC8 } from "@/lib/formatToUTC8";
import { CheckInUser } from "../page";
import { Skeleton } from "@/components/ui/skeleton";

interface ManualCheckInProps {
    users: CheckInUser[];
}

const ManualCheckIn = ({ users }: ManualCheckInProps) => {
    // 狀態管理
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<CheckInUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<CheckInUser | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showResults, setShowResults] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // 處理搜尋邏輯
    useEffect(() => {
        if (searchTerm.length >= 2) {
            setIsSearching(true);
            setShowResults(true);

            // 簡單的模糊搜尋實現
            const results = users.filter((user) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setFilteredUsers(results);
            setIsSearching(false);
        } else {
            setFilteredUsers([]);
        }
    }, [searchTerm, users]);

    // 處理簽到功能
    const handleCheckIn = async (user: CheckInUser) => {
        if (!user.uuid) return;

        setIsCheckingIn(true);
        setError("");

        try {
            const checkInData = {
                date: formatToUTC8(new Date()),
                checkIn: true,
                note: "手動簽到",
            };

            const response = await fetch("/api/helpers/checkIn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uuid: user.uuid,
                    checkInData,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 更新選中用戶的簽到記錄
                setSelectedUser((prev) =>
                    prev ? { ...prev, checkIns: [...(prev.checkIns || []), checkInData] } : null
                );

                setSuccessMessage(`${user.name} 簽到成功！`);
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                setError(`簽到失敗: ${data.error || "未知錯誤"}`);
            }
        } catch (err) {
            console.error("簽到處理錯誤:", err);
            setError("簽到處理發生錯誤");
        } finally {
            setIsCheckingIn(false);
        }
    };

    // 清除選中的用戶
    const clearSelectedUser = () => {
        setSelectedUser(null);
        setSearchTerm("");
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // 選擇一個用戶
    const selectUser = (user: CheckInUser) => {
        setSelectedUser(user);
        setSearchTerm("");
        setShowResults(false);
    };

    // 格式化飲食偏好
    const formatDietary = (dietary?: string) => {
        if (!dietary || dietary === "new") return "未設定";
        return dietary === "vegan" ? "素食" : "葷食";
    };

    // 格式化晚宴參加
    const formatDinner = (goingDinner?: boolean | string) => {
        if (goingDinner === undefined || goingDinner === null) return "未設定";
        return goingDinner ? "參加" : "不參加";
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">手動簽到系統</CardTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        已載入 {users.length} 位使用者資料
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 搜尋區域 */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="輸入姓名搜尋..."
                                    className="pl-10 pr-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => {
                                        if (searchTerm.length >= 2) {
                                            setShowResults(true);
                                        }
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 搜尋結果 */}
                        {showResults && searchTerm.length >= 2 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-56 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-2 text-center">
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-full mt-2" />
                                    </div>
                                ) : filteredUsers.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredUsers.map((user) => (
                                            <li key={user.uuid}>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                                                    onClick={() => selectUser(user)}
                                                >
                                                    <div>
                                                        <span className="font-medium">
                                                            {user.name}
                                                        </span>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {user.department}
                                                        </span>
                                                    </div>
                                                    {user.payment?.paid ? (
                                                        <Badge className="bg-green-500">
                                                            已付款
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">未付款</Badge>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        找不到符合的使用者
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 錯誤或成功訊息 */}
                    {error && (
                        <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-5 w-5 inline-block mr-2" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="text-center text-green-600 bg-green-50 p-3 rounded-lg animate-pulse">
                            <CheckCircle className="h-5 w-5 inline-block mr-2" />
                            {successMessage}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 選中的使用者資訊卡 */}
            {selectedUser && (
                <Card
                    className={`${
                        selectedUser.payment?.paid === false
                            ? "border-red-300 bg-red-50"
                            : "border-green-300 bg-green-50"
                    }`}
                >
                    <CardHeader className="pb-2 flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>{selectedUser.name}</CardTitle>
                            <p className="text-sm text-gray-600">{selectedUser.department}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelectedUser}
                            className="h-8 w-8 p-0 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="text-sm font-medium text-gray-600">付款狀態:</div>
                            <div className="text-sm">
                                {selectedUser.payment?.paid ? (
                                    <Badge className="bg-green-500">已付款</Badge>
                                ) : (
                                    <Badge variant="destructive" className="bg-red-500">
                                        未付款
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm font-medium text-gray-600">飲食偏好:</div>
                            <div className="text-sm">{formatDietary(selectedUser.dietary)}</div>

                            <div className="text-sm font-medium text-gray-600">晚宴:</div>
                            <div className="text-sm">{formatDinner(selectedUser.going_dinner)}</div>

                            <div className="text-sm font-medium text-gray-600">UUID:</div>
                            <div className="text-sm font-mono truncate">{selectedUser.uuid}</div>
                        </div>

                        {/* 過往簽到記錄 */}
                        {selectedUser.checkIns && selectedUser.checkIns.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">過往簽到紀錄:</h4>
                                <div className="text-xs space-y-1 max-h-24 overflow-y-auto bg-gray-50 p-2 rounded">
                                    {selectedUser.checkIns.map((check, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{check.date}</span>
                                            <Badge variant="outline" className="text-xs h-5">
                                                {check.checkIn ? "簽到" : "簽退"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 簽到按鈕 */}
                        <Button
                            className="w-full"
                            onClick={() => handleCheckIn(selectedUser)}
                            disabled={isCheckingIn}
                        >
                            {isCheckingIn ? (
                                <>
                                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                                    處理中...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    簽到
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ManualCheckIn;
