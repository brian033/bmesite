// app/admin/page.tsx
import { withRoleProtection } from "@/lib/withRoleProtection";
import clientPromise from "@/lib/mongodb";
import UserTable from "./components/UserTable";
import { User } from "@/types/user";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
export default async function AdminPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const users = await db.collection("users").find({}).toArray();
    const usersCleaned = users.map((user) => {
        return {
            ...user,
            _id: user._id.toString(),
        } as User;
    });
    const submissions = await db.collection("submissions").find({}).toArray();
    const submissionsCleaned = submissions.map((submission) => {
        return {
            ...submission,
            _id: submission._id.toString(),
        } as Submission;
    });
    const documents = await db.collection("documents").find({}).toArray();
    const documentsCleaned = documents.map((document) => {
        return {
            ...document,
            _id: document._id.toString(),
        } as Document;
    });

    return (
        <UserTable
            db_user={usersCleaned}
            db_submissions={submissionsCleaned}
            db_documents={documentsCleaned}
        />
    );
}
