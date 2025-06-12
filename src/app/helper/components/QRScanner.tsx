"use client";

import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, CheckCircle, UserCheck, AlertCircle } from "lucide-react";
import { formatToUTC8 } from "@/lib/formatToUTC8";
import { CheckInUser } from "../page";
import { Skeleton } from "@/components/ui/skeleton";

interface ScanResult {
    id: string;
    text: string;
    timestamp: Date;
    userData?: CheckInUser;
    isCheckedIn?: boolean;
}

interface QRScannerProps {
    users: CheckInUser[];
}

const decodedData = (encodedString: string) => {
    try {
        const jsonString = atob(encodedString); // 解碼
        return jsonString;
    } catch (err) {
        console.error("解碼失敗:", err);
        return "not_valid";
    }
};

const QRScanner = ({ users }: QRScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string>("");
    const [checkingIn, setCheckingIn] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const startContinuousScanning = async () => {
        try {
            setError("");
            setIsScanning(true);

            const codeReader = new BrowserMultiFormatReader();
            codeReaderRef.current = codeReader;

            // 持續掃描模式
            await codeReader.decodeFromVideoDevice(
                undefined,
                videoRef.current!,
                (result, error) => {
                    if (result) {
                        // 取得掃描到的內容
                        const decodedText = decodedData(result.getText());

                        try {
                            // 嘗試將內容解析為 JSON
                            const parsedData = JSON.parse(decodedText);

                            // 檢查是否有 uuid 欄位
                            if (parsedData && parsedData.uuid) {
                                // 搜尋對應的使用者
                                const matchedUser = users.find(
                                    (user) => user.uuid === parsedData.uuid
                                );

                                const newResult: ScanResult = {
                                    id: Date.now().toString(),
                                    text: decodedText,
                                    timestamp: new Date(),
                                    userData: matchedUser,
                                    isCheckedIn: false,
                                };

                                // 檢查是否已經掃描過相同內容（避免重複）
                                setScanResults((prev) => {
                                    // 檢查是否已經有相同 UUID 的結果
                                    const exists = prev.some(
                                        (r) =>
                                            r.userData &&
                                            matchedUser &&
                                            r.userData.uuid === matchedUser.uuid
                                    );

                                    if (!exists) {
                                        return [newResult, ...prev]; // 新的結果放在最前面
                                    }
                                    return prev;
                                });
                            } else {
                                // 如果解析成功但沒有 uuid 欄位
                                const newResult: ScanResult = {
                                    id: Date.now().toString(),
                                    text: decodedText,
                                    timestamp: new Date(),
                                };

                                // 避免重複添加相同內容
                                setScanResults((prev) => {
                                    const exists = prev.some((r) => r.text === newResult.text);
                                    if (!exists) {
                                        return [newResult, ...prev];
                                    }
                                    return prev;
                                });
                            }
                        } catch (parseError) {
                            // JSON 解析失敗，添加原始內容
                            const newResult: ScanResult = {
                                id: Date.now().toString(),
                                text: decodedText,
                                timestamp: new Date(),
                            };

                            // 避免重複添加相同內容
                            setScanResults((prev) => {
                                const exists = prev.some((r) => r.text === newResult.text);
                                if (!exists) {
                                    return [newResult, ...prev];
                                }
                                return prev;
                            });
                        }
                    }

                    if (error && error.name !== "NotFoundException") {
                        console.log("掃描錯誤:", error);
                    }
                }
            );
        } catch (err) {
            console.error("啟動掃描失敗:", err);
            setError("無法啟動攝影機，請檢查權限設定");
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
            codeReaderRef.current = null;
        }
        setIsScanning(false);
    };

    const clearResults = () => {
        setScanResults([]);
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(""), 2000);
        } catch (err) {
            console.error("複製失敗:", err);
        }
    };

    const deleteResult = (id: string) => {
        setScanResults((prev) => prev.filter((result) => result.id !== id));
    };

    // 處理簽到功能
    const handleCheckIn = async (uuid: string, resultId: string) => {
        if (!uuid) return;

        setCheckingIn(resultId);

        try {
            const checkInData = {
                date: formatToUTC8(new Date()),
                checkIn: true,
                note: "QR Code 簽到",
            };

            const response = await fetch("/api/helpers/checkIn", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uuid,
                    checkInData,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 更新掃描結果，標記為已簽到，並更新 checkIns 資料
                setScanResults((prev) =>
                    prev.map((result) => {
                        if (result.id === resultId) {
                            // 更新對應的結果
                            return {
                                ...result,
                                isCheckedIn: true,
                                // 更新 userData 中的 checkIns 為 API 返回的最新資料
                                userData: result.userData
                                    ? {
                                          ...result.userData,
                                          checkIns: data.user.checkIns,
                                      }
                                    : undefined,
                            };
                        }
                        return result;
                    })
                );

                // 顯示成功訊息
                setSuccessMessage(`成功為 ${data.user.name || data.user.uuid} 簽到！`);
                setTimeout(() => setSuccessMessage(""), 2000);
            } else {
                setError(`簽到失敗: ${data.error || "未知錯誤"}`);
                setTimeout(() => setError(""), 3000);
            }
        } catch (err) {
            console.error("簽到處理錯誤:", err);
            setError("簽到處理發生錯誤");
            setTimeout(() => setError(""), 3000);
        } finally {
            setCheckingIn("");
        }
    };

    useEffect(() => {
        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
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
                    <CardTitle className="text-center">QR Code 掃描器</CardTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        已載入 {users.length} 位使用者資料
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 攝影機畫面 */}
                    <div className="flex justify-center">
                        <video
                            ref={videoRef}
                            className="rounded-lg border max-w-md w-full"
                            style={{ display: isScanning ? "block" : "none" }}
                        />
                        {!isScanning && (
                            <div className="max-w-md w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <p className="text-gray-500">點擊開始掃描以啟動攝影機</p>
                            </div>
                        )}
                    </div>

                    {/* 控制按鈕 */}
                    <div className="flex gap-2 justify-center">
                        {!isScanning ? (
                            <Button onClick={startContinuousScanning} className="px-8">
                                開始掃描
                            </Button>
                        ) : (
                            <Button onClick={stopScanning} variant="outline" className="px-8">
                                停止掃描
                            </Button>
                        )}

                        {scanResults.length > 0 && (
                            <Button onClick={clearResults} variant="destructive" size="sm">
                                清除所有結果
                            </Button>
                        )}
                    </div>

                    {/* 成功訊息 */}
                    {successMessage && (
                        <div className="text-center text-green-600 bg-green-50 p-3 rounded-lg animate-pulse">
                            <CheckCircle className="h-5 w-5 inline-block mr-2" />
                            {successMessage}
                        </div>
                    )}

                    {/* 錯誤訊息 */}
                    {error && (
                        <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-5 w-5 inline-block mr-2" />
                            {error}
                        </div>
                    )}

                    {/* 掃描狀態 */}
                    <div className="text-center">
                        <Badge variant={isScanning ? "default" : "secondary"}>
                            {isScanning ? "正在掃描..." : "等待開始"}
                        </Badge>
                        {scanResults.length > 0 && (
                            <span className="ml-2 text-sm text-gray-600">
                                已掃描 {scanResults.length} 個項目
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 掃描結果列表 */}
            {scanResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>掃描結果</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {scanResults.map((result) => (
                                <div
                                    key={result.id}
                                    className={`p-4 border rounded-lg ${
                                        result.userData
                                            ? result.isCheckedIn
                                                ? "bg-blue-50 hover:bg-blue-100"
                                                : result.userData.payment?.paid === false
                                                ? "bg-red-50 hover:bg-red-100"
                                                : "bg-green-50 hover:bg-green-100"
                                            : "bg-gray-50 hover:bg-gray-100"
                                    } transition-colors`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-sm break-all">
                                                {result.text}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                掃描時間: {formatTime(result.timestamp)}
                                            </p>
                                        </div>

                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    copyToClipboard(result.text, result.id)
                                                }
                                                className="h-8 w-8 p-0"
                                            >
                                                {copiedId === result.id ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteResult(result.id)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 匹配到用戶時顯示用戶資料和簽到按鈕 */}
                                    {result.userData && (
                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-medium text-gray-800">
                                                    使用者資料
                                                </h3>
                                                {result.isCheckedIn && (
                                                    <Badge className="bg-blue-500">已簽到</Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                                                <div className="text-sm font-medium text-gray-600">
                                                    姓名:
                                                </div>
                                                <div className="text-sm">
                                                    {result.userData.name || "未設定"}
                                                </div>

                                                <div className="text-sm font-medium text-gray-600">
                                                    單位:
                                                </div>
                                                <div className="text-sm">
                                                    {result.userData.department || "未設定"}
                                                </div>

                                                <div className="text-sm font-medium text-gray-600">
                                                    付款狀態:
                                                </div>
                                                <div className="text-sm">
                                                    {result.userData.payment?.paid ? (
                                                        <Badge className="bg-green-500">
                                                            已付款
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="destructive"
                                                            className="bg-red-500"
                                                        >
                                                            未付款
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-sm font-medium text-gray-600">
                                                    飲食偏好:
                                                </div>
                                                <div className="text-sm">
                                                    {formatDietary(result.userData.dietary)}
                                                </div>

                                                <div className="text-sm font-medium text-gray-600">
                                                    晚宴:
                                                </div>
                                                <div className="text-sm">
                                                    {formatDinner(result.userData.going_dinner)}
                                                </div>

                                                <div className="text-sm font-medium text-gray-600">
                                                    UUID:
                                                </div>
                                                <div className="text-sm font-mono truncate">
                                                    {result.userData.uuid}
                                                </div>
                                            </div>

                                            {/* 已經簽到的紀錄 */}
                                            {result.userData.checkIns &&
                                                result.userData.checkIns.length > 0 && (
                                                    <div className="mb-3">
                                                        <h4 className="text-sm font-medium mb-1">
                                                            簽到記錄:
                                                        </h4>
                                                        <div className="text-xs space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                                                            {result.userData.checkIns.map(
                                                                (check, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">
                                                                                {check.date}
                                                                            </span>
                                                                            {check.note && (
                                                                                <span className="text-gray-500">
                                                                                    {check.note}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <Badge
                                                                            variant={
                                                                                check.checkIn
                                                                                    ? "default"
                                                                                    : "outline"
                                                                            }
                                                                            className="text-xs h-5"
                                                                        >
                                                                            {check.checkIn
                                                                                ? "簽到"
                                                                                : "簽退"}
                                                                        </Badge>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* 簽到按鈕或已簽到狀態 */}
                                            {!result.isCheckedIn ? (
                                                <Button
                                                    className="w-full mt-2"
                                                    onClick={() =>
                                                        handleCheckIn(
                                                            result.userData!.uuid,
                                                            result.id
                                                        )
                                                    }
                                                    disabled={checkingIn === result.id}
                                                >
                                                    {checkingIn === result.id ? (
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
                                            ) : (
                                                <div className="w-full mt-2 p-3 bg-blue-50 rounded-md text-center">
                                                    <div className="flex items-center justify-center text-blue-700 text-sm mb-1">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        已完成簽到
                                                    </div>
                                                    {result.userData.checkIns &&
                                                        result.userData.checkIns.length > 0 && (
                                                            <div className="text-xs text-gray-600">
                                                                最近簽到時間:{" "}
                                                                {
                                                                    result.userData.checkIns[
                                                                        result.userData.checkIns
                                                                            .length - 1
                                                                    ].date
                                                                }
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 掃描內容不是有效 QR code 的情況 */}
                                    {!result.userData && result.text !== "not_valid" && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="flex items-center text-amber-600 gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">無匹配使用者資料</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 解碼失敗的情況 */}
                                    {result.text === "not_valid" && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="flex items-center text-red-600 gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">無效的 QR Code 格式</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QRScanner;
