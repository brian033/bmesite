import { ObjectId } from "mongodb";

export type Payment = {
    _id?: ObjectId;
    paymentId: string;
    paymentOwner: string;
    paymentStatus: "created" | "paid" | "failed";
    paymentValue: number;
    paymentType: "member" | "non-member";
    paymentParams: ECPayFormParams;
    paymentResponse?: any;
    updatedAt?: string;
    ecpayResponse?: any;
};

export interface ECPayFormParams {
    MerchantID: string; // 特店編號
    MerchantTradeNo: string; // 訂單編號
    MerchantTradeDate: string; // YYYY/MM/DD HH:MM:SS
    PaymentType: "aio"; // 付款方式
    TotalAmount: number; // 總金額, int
    TradeDesc: string;
    ItemName:
        | "生機農機人學會年會2025 - 一般參加者註冊費用"
        | "生機農機人學會年會2025 - 學會參加者註冊費用";
    ReturnURL: string;
    ChoosePayment: "ALL";
    CheckMacValue: string;
    EncryptType: 1;

    ClientBackURL?: string;
    OrderResultURL?: string;
}
