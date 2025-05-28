import { withRoleProtection } from "@/lib/withRoleProtection";
import AnnouncementForm from "./components/AnnounceForm";
import ImportantDateForm from "./components/ImportantDateForm";
import AnnouncementCard from "../components/AnnouncementCard";
import ImportantDatesCard from "../components/ImportantDatesCard";
export default async function PaymentsPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    return (
        <div>
            <AnnouncementForm />
            <ImportantDateForm />
        </div>
    );
}
