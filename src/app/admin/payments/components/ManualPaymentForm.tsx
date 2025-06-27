"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ManualPaymentForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        userId: "",
        amount: "",
        note: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 簡單驗證
        if (!formData.userId || !formData.amount || !formData.note) {
            setError("所有欄位都必須填寫");
            return;
        }

        const amount = Number(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            setError("請輸入有效的金額");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch("/api/admin/manual_payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: amount,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "登記付款失敗");
            }

            toast.success("付款登記成功");
            setFormData({ userId: "", amount: "", note: "" }); // 清空表單
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "登記付款時發生錯誤");
            toast.error("登記付款失敗");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">登記手動付款</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">用戶 UUID</label>
                    <Input
                        value={formData.userId}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, userId: e.target.value }))
                        }
                        placeholder="輸入用戶UUID，可以去管理使用者頁面複製。"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">付款金額</label>
                    <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        placeholder="輸入金額"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">付款備註</label>
                    <Input
                        value={formData.note}
                        onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="例如: 銀行轉帳後五碼"
                    />
                </div>

                {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "處理中..." : "確認登記"}
                </Button>
            </form>
        </div>
    );
}
