import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Submission } from "@/types/submission";

const handler = async (req: NextRequest, session: any) => {
    try {
        // 解析請求體
        const body = await req.json();
        const { submissionId, updates } = body;
        const { submissionType, submissionStatus } = updates;

        // 檢查必填欄位
        if (!submissionId) {
            return NextResponse.json({ error: "缺少審稿案ID" }, { status: 400 });
        }

        if (!updates) {
            return NextResponse.json({ error: "缺少更新內容" }, { status: 400 });
        }

        // 確保 submissionType 和 submissionStatus 都存在
        if (!submissionType) {
            return NextResponse.json({ error: "缺少 submissionType 欄位" }, { status: 400 });
        }

        if (!submissionStatus) {
            return NextResponse.json({ error: "缺少 submissionStatus 欄位" }, { status: 400 });
        }

        // 驗證 submissionType 的值
        if (!["full_paper", "abstracts"].includes(submissionType)) {
            return NextResponse.json(
                { error: "submissionType 值必須為 full_paper 或 abstracts" },
                { status: 400 }
            );
        }

        // 驗證 submissionStatus 的值
        if (!["pending", "accepted", "rejected", "replied", "waiting"].includes(submissionStatus)) {
            return NextResponse.json(
                {
                    error: "submissionStatus 值必須為 pending、accepted、rejected、replied 或 waiting",
                },
                { status: 400 }
            );
        }

        // 連接資料庫
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const submissionDB = db.collection("submissions");
        const documentsDB = db.collection("documents");

        // 檢查提交是否存在
        const submission = (await submissionDB.findOne({ submissionId })) as Submission;
        if (!submission) {
            return NextResponse.json({ error: "未找到指定的審稿案" }, { status: 404 });
        }
        // 審稿者角色的狀態轉換規則驗證
        // 如果是 admin，則跳過這些規則檢查
        if (session.user.role === "reviewer") {
            const currentType = submission.submissionType;
            const currentStatus = submission.submissionStatus;

            // 定義有效的狀態轉換規則
            const isValidTransition =
                // 1. abstract + pending 的轉換規則
                (currentType === "abstracts" &&
                    currentStatus === "pending" &&
                    // 可以變成 abstract + replied
                    ((submissionType === "abstracts" && submissionStatus === "replied") ||
                        // 或 abstract + rejected
                        (submissionType === "abstracts" && submissionStatus === "rejected") ||
                        // 或 full_paper + waiting
                        (submissionType === "full_paper" && submissionStatus === "waiting"))) ||
                // 2. full_paper + pending 的轉換規則
                (currentType === "full_paper" &&
                    currentStatus === "pending" &&
                    // 可以變成 full_paper + replied
                    ((submissionType === "full_paper" && submissionStatus === "replied") ||
                        // 或 full_paper + approved (接受)
                        (submissionType === "full_paper" && submissionStatus === "accepted") ||
                        // 或 full_paper + rejected (拒絕)
                        (submissionType === "full_paper" && submissionStatus === "rejected"))) ||
                // 4. 相同狀態的更新總是允許的（避免重複提交相同狀態導致錯誤）
                (currentType === submissionType && currentStatus === submissionStatus);

            if (!isValidTransition) {
                return NextResponse.json(
                    {
                        error: "狀態轉換不符合規則",
                        details: {
                            currentType,
                            currentStatus,
                            requestedType: submissionType,
                            requestedStatus: submissionStatus,
                            allowedTransitions: [
                                "abstracts+pending → abstracts+replied / abstracts+rejected / full_paper+waiting",
                                "full_paper+pending → full_paper+replied / full_paper+accepted / full_paper+rejected",
                            ],
                        },
                    },
                    { status: 403 }
                );
            }
        }

        // 準備更新的欄位
        const updateFields: Record<string, any> = {
            submissionUpdatedAt: new Date().toISOString(),
            submissionReviewedAt: new Date().toISOString(),
            submissionType,
            submissionStatus,
        };

        // 執行更新
        const updateResult = await submissionDB.updateOne(
            { submissionId },
            {
                $set: updateFields,
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: "更新失敗" }, { status: 500 });
        }

        // 獲取更新後的提交資料
        const updatedSubmission = (await submissionDB.findOne({ submissionId })) as Submission;

        return NextResponse.json({
            success: true,
            message: "提交資料已更新",
            submission: {
                ...updatedSubmission,
                _id: updatedSubmission._id.toString(),
            },
        });
    } catch (err) {
        console.error("修改提交狀態時出錯:", err);
        return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
    }
};

export const PUT = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
