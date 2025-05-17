// app/admin/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import UserTable from "./components/UserTable";
import { User } from "@/types/user";
import { Payment } from "@/types/payment";
import { Submission } from "@/types/submission";

export default async function AdminPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const users = (await db.collection("users").find({}).toArray()).map((user) => {
        const { _id, ...userWithoutId } = user;
        return { ...userWithoutId };
    }) as User[];

    const submissions = (await db.collection("submissions").find({}).toArray()).map(
        (submission) => {
            const { _id, ...submissionWithoutId } = submission;
            return { ...submissionWithoutId };
        }
    ) as Submission[]; // Change type from User[] to Submission[]
    const payments = (await db.collection("payments").find({}).toArray()).map((payment) => {
        const { _id, ...paymentWithoutId } = payment;
        return { ...paymentWithoutId };
    }) as Payment[]; // Change type from User[] to Payment[]

    return (
        <div className="mx-2">
            <UserTable db_user={users} db_submissions={submissions} db_payments={payments} />
        </div>
    );
}
