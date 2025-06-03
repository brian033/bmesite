"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PaymentButtonProps {
    paymentOptionId: string; // 改為接收任意 paymentOptionId
    buttonText?: string; // 可選的按鈕文字
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    disabled?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export default function PaymentButton({
    paymentOptionId,
    buttonText, // 可由外部傳入
    className = "",
    variant = "default",
    size = "default",
    disabled = false,
    onSuccess,
    onError,
}: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 呼叫後端API建立訂單，傳遞 paymentOptionId
            const response = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paymentOptionId }), // 更新為使用 paymentOptionId
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || data.error || "創建訂單失敗");
            }

            // 建立表單並提交到綠界
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.paymentUrl;
            form.target = "_blank"; // 在新視窗中開啟

            // 添加表單字段
            for (const [key, value] of Object.entries(data.formData)) {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            // 調用成功回調
            if (onSuccess) {
                onSuccess(data);
            }
        } catch (err: any) {
            console.error("付款處理錯誤:", err);
            setError(err.message || "處理付款時發生錯誤");

            // 調用錯誤回調
            if (onError) {
                onError(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 使用傳入的按鈕文字或提供一個通用文字
    const defaultButtonText = "前往付款";

    return (
        <div className="space-y-2">
            {error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button
                onClick={handlePayment}
                disabled={disabled || isLoading}
                className={className}
                variant={variant}
                size={size}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {buttonText || defaultButtonText}
                    </>
                )}
            </Button>
        </div>
    );
}
