import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Submission } from "@/types/submission";

const handler = async (req: NextRequest, session: any) => {
    try {
        // 解析請求體
        const body = await req.json();
        const { submissionId, updates } = body;
        const { updatedPresentType, updatedTopic } = updates;
        // 檢查各自欄位
        if (!submissionId) {
            return NextResponse.json({ error: "缺少提交ID" }, { status: 400 });
        }
        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "缺少更新內容" }, { status: 400 });
        }

        if (
            updatedTopic &&
            ![
                "生物產業機械",
                "生物生產工程",
                "畜牧自動化與污染防治",
                "農業設施與環控工程",
                "生物機電控制",
                "生醫工程與微奈米機電",
                "生物資訊與系統",
                "能源與節能技術",
                "AI與大數據分析",
                "精準農業智動化",
                "其他新興科技",
            ].includes(updatedTopic)
        ) {
            return NextResponse.json({ error: "主題不正確" }, { status: 400 });
        }

        if (updatedPresentType && !["oral", "poster"].includes(updatedPresentType)) {
            return NextResponse.json({ error: "發表類型不正確" }, { status: 400 });
        }

        // 連接資料庫
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const submissionDB = db.collection("submissions");

        // 檢查提交是否存在
        const submission = (await submissionDB.findOne({ submissionId })) as Submission;
        if (!submission) {
            return NextResponse.json({ error: "未找到指定的提交" }, { status: 404 });
        }
        let submissionType = submission.submissionType;
        let submissionTopic = submission.submissionTopic;
        if (updatedPresentType) {
            submissionType = updatedPresentType;
        }
        if (updatedTopic) {
            submissionTopic = updatedTopic;
        }
        // 執行更新
        const updateResult = await submissionDB.updateOne(
            { submissionId },
            {
                $set: {
                    submissionPresentType: submissionType,
                    submissionTopic: submissionTopic,
                    submissionUpdatedAt: new Date().toISOString(),
                },
            }
        );

        return NextResponse.json({
            success: true,
            message: "提交資料已更新",
        });
    } catch (err) {
        console.error("修改提交資料時出錯:", err);
        return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
    }
};

export const PUT = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
