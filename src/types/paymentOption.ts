import { ObjectId } from "mongodb";
export type PaymentOption = {
    _id?: ObjectId | string;
    // 基本識別
    paymentOptionId: string; // 唯一標識符 (如 "member", "non-member", "student")
    name: string; // 管理後台顯示名稱 (如 "學會會員", "一般參加者")
    // 價格相關
    price: number; // 價格 (如 5000, 10000)
    // 綠界交易資訊
    tradeDescription: string; // 交易描述 (給綠界)
    itemName: string; // 商品名稱 (給綠界)

    // 時間限制
    validFrom: Date; // 開始生效時間 (null = 立即生效)
    goodUntil: Date; // 結束生效時間 (null = 永久有效)

    // UI/前台顯示
    displayOrder: number; // 顯示順序
    displayName: string; // 前台顯示名稱
    description: string; // 詳細描述

    // 記錄
    createdAt: Date;
};
