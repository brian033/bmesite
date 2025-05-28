import { withRoleProtection } from "@/lib/withRoleProtection";
import BulkSubmissionGenerator from "../components/BulkSubmissionGenerator";

export default async function StressTestPage() {
    // 保護此頁面，只有管理員可以訪問
    await withRoleProtection(["admin"]);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">系統壓力測試</h1>
            <div className="max-w-2xl mx-auto">
                <BulkSubmissionGenerator />
            </div>
        </div>
    );
}
