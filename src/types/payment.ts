import { ObjectId } from "mongodb";

export type Payment = {
    _id?: ObjectId;
    paymentId: string;
    paymentOwner: string;
    paymentStatus: "created" | "paid" | "failed";
    paymentValue: number;
    paymentType: string;
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
    ItemName: string;
    ReturnURL: string;
    ChoosePayment: "ALL";
    CheckMacValue: string;
    EncryptType: 1;

    ClientBackURL?: string;
    OrderResultURL?: string;
}
