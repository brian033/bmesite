// app/admin/user_management/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import UserTable from "./components/UserTable";
import { User } from "@/types/user";
import { Payment } from "@/types/payment";
import { Submission } from "@/types/submission";
import { ObjectId } from "mongodb";

// 輔助函數：將 MongoDB 文檔轉換為可序列化的純對象
function serializeDocument(doc: any) {
    return JSON.parse(
        JSON.stringify(doc, (key, value) => {
            // 處理 ObjectId
            if (value instanceof ObjectId) {
                return value.toString();
            }
            // 處理 Date 對象
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        })
    );
}

export default async function AdminPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 獲取並序列化用戶數據
    const usersRaw = await db.collection("users").find({}).toArray();
    const users = usersRaw.map((user) => {
        const { _id, ...userWithoutId } = user;
        return serializeDocument({ ...userWithoutId });
    }) as User[];

    // 獲取並序列化提交數據
    const submissionsRaw = await db.collection("submissions").find({}).toArray();
    const submissions = submissionsRaw.map((submission) => {
        const { _id, ...submissionWithoutId } = submission;
        return serializeDocument({ ...submissionWithoutId });
    }) as Submission[];

    // 獲取並序列化支付數據
    const paymentsRaw = await db.collection("payments").find({}).toArray();
    const payments = paymentsRaw.map((payment) => {
        const { _id, ...paymentWithoutId } = payment;
        return serializeDocument({ ...paymentWithoutId });
    }) as Payment[];

    return (
        <div className="mx-2">
            <UserTable db_user={users} db_submissions={submissions} db_payments={payments} />
        </div>
    );
}
