import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import { User } from "@/types/user";
import { Payment } from "@/types/payment";
import PaymentsTable from "./components/PaymentsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ManualPaymentForm from "./components/ManualPaymentForm";
/**
 * 付款記錄管理頁面
 *
 * 本頁面本身撈取的是後端資料庫資料，使用綠界api查詢的按鈕會向綠界的伺服器發送請求並顯示結果，若沒有需要請不要使用
 *
 * 此頁面受到角色保護，僅允許管理員訪問。
 * 功能包括：
 * - 顯示所有付款記錄，按創建時間倒序排列
 * - 關聯顯示用戶信息（姓名、郵箱、部門等）
 * - 通過PaymentsTable元件展示數據
 *
 * @returns {JSX.Element} 付款記錄管理頁面的元件
 */
export default async function PaymentsPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 獲取所有付款記錄
    const payments: Payment[] = (await db
        .collection("payments")
        .find({})
        .sort({ _id: -1 }) // 最新的記錄優先
        .toArray()) as Payment[];

    // 獲取所有付款記錄涉及的用戶 ID
    const userIds = [...new Set(payments.map((p) => p.paymentOwner))];

    // 獲取這些用戶的信息
    const users: User[] =
        userIds.length > 0
            ? ((await db
                  .collection("users")
                  .find({ uuid: { $in: userIds } })
                  .project({ _id: 0 }) // 排除 _id 欄位
                  .toArray()) as User[])
            : [];

    // 創建用戶 ID 到用戶信息的映射
    const userMap: Record<string, User> = {};
    users.forEach((user) => {
        userMap[user.uuid] = user;
    });

    // 處理數據以便在表格中顯示
    const tableData = payments.map((payment) => {
        const user = userMap[payment.paymentOwner];

        return {
            paymentId: payment.paymentId,
            createdAt: payment._id
                ? new Date(parseInt(payment._id.toString().substring(0, 8), 16) * 1000)
                : new Date(),
            paymentStatus: payment.paymentStatus,
            paymentValue: payment.paymentValue,
            paymentType: payment.paymentType,
            userId: payment.paymentOwner,
            userName: user?.name || "未知用戶",
            userEmail: user?.email || "無郵箱",
            userContactEmail: user?.contact_email || "無聯絡郵箱",
            userDepartment: user?.department || "未填寫",
            user: user || null,
        };
    });

    return (
        <div className="p-3">
            <ManualPaymentForm />
            <h1 className="text-3xl font-bold mb-6">付款記錄管理</h1>

            {/* 警語 Banner */}
            <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-medium">重要提醒</AlertTitle>
                <AlertDescription className="text-amber-700">
                    本頁面本身撈取的是後端資料庫資料，「使用綠界API查詢」按鈕會向綠界的伺服器發送請求並顯示結果，若沒有需要請不要使用。
                    過度頻繁的查詢可能會被綠界限流。
                </AlertDescription>
            </Alert>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <PaymentsTable payments={tableData} />
            </div>
        </div>
    );
}
