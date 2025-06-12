"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle } from "lucide-react";

interface QRCodeGeneratorProps {
    uuid: string;
    title?: string;
    size?: number;
    className?: string;
}

const QRCodeGenerator = ({
    uuid,
    title = "用戶 QR Code",
    size = 200,
    className = "",
}: QRCodeGeneratorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrData, setQrData] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        generateQRCode();
    }, [uuid, size]);

    const generateQRCode = async () => {
        if (!uuid) {
            setError("UUID 不能為空");
            return;
        }

        try {
            setError("");

            // 創建要編碼的 JSON 資料
            const jsonData = JSON.stringify({ uuid });
            const encodedData = btoa(jsonData); // 編碼
            setQrData(encodedData);

            // 生成 QR Code
            if (canvasRef.current) {
                await QRCode.toCanvas(canvasRef.current, encodedData, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: "#000000", // 黑色前景
                        light: "#FFFFFF", // 白色背景
                    },
                    errorCorrectionLevel: "M", // 中等錯誤修正等級
                });
            }
        } catch (err) {
            console.error("生成 QR Code 失敗:", err);
            setError("生成 QR Code 失敗");
        }
    };

    const downloadQRCode = () => {
        if (!canvasRef.current) return;

        const link = document.createElement("a");
        link.download = `qrcode-${uuid}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="text-center text-red-600">{error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            <div className="flex justify-center">
                <canvas ref={canvasRef} className="border rounded-lg" />
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2 justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    下載條碼
                </Button>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
