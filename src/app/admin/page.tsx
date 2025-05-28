import { withRoleProtection } from "@/lib/withRoleProtection";
import AnnouncementForm from "./components/AnnounceForm";
export default async function PaymentsPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    return (
        <div>
            <AnnouncementForm />
        </div>
    );
}
