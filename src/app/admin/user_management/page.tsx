// app/admin/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import UserTable from "./components/UserTable";

export default async function AdminPage() {
    const _session = await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = await db.collection("users").find({}).toArray();

    const userList = users.map((user) => ({
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        address: user.address,
        department: user.department,
        payment: user.payment,
        uploaded_pdfs: user.uploaded_pdfs,
        uuid: user.uuid,
        role: user.role,
        createdAt: user.createdAt,
    }));

    return <UserTable initialUsers={userList} />;
}
