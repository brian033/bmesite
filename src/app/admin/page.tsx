import { withRoleProtection } from "@/lib/withRoleProtection";
import AnnouncementForm from "./components/AnnounceForm";
import ImportantDateForm from "./components/ImportantDateForm";
import AnnouncementCard from "../components/AnnouncementCard";
import ImportantDatesCard from "../components/ImportantDatesCard";
export default async function PaymentsPage() {
    await withRoleProtection(["admin"]); // 👈 只讓 admin 進來

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">管理控制台</h1>

            {/* 公告管理區塊 */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 pb-2 border-b">公告管理</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* 左側：新增公告表單 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">新增公告</h3>
                        <AnnouncementForm />
                    </div>

                    {/* 右側：公告列表 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">即時公告</h3>
                        <AnnouncementCard />
                    </div>
                </div>
            </div>

            {/* 重要日期管理區塊 */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6 pb-2 border-b">重要日期管理</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* 左側：新增重要日期表單 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">新增重要日期</h3>
                        <ImportantDateForm />
                    </div>

                    {/* 右側：重要日期列表 */}
                    <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">即時重要日期</h3>
                        <ImportantDatesCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
