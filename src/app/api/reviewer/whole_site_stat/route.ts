import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";

import { Submission } from "@/types/submission";

// 所有可能的主題
const topicList = {
    生物產業機械: "A",
    生物生產工程: "B",
    畜牧自動化與污染防治: "C",
    農業設施與環控工程: "D",
    生物機電控制: "E",
    生醫工程與微奈米機電: "F",
    生物資訊與系統: "G",
    能源與節能技術: "H",
    AI與大數據分析: "I",
    精準農業智動化: "J",
    農機安全: "K",
    其他新興科技: "L",
};

const handler = async (req: NextRequest, session: any) => {
    // 檢查使用者是否為 reviewer 或 admin
    if (session.user.role !== "admin" && session.user.role !== "reviewer") {
        return NextResponse.json({ error: "只有審稿者和管理員可以使用此功能" }, { status: 403 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const submissions = (await db.collection("submissions").find().toArray()) as Submission[];

    const submissionCount = submissions.length;

    // 初始化數據結構以包含所有主題
    const topicAnalytics = {} as Record<
        string,
        {
            total: number;
            full_paper_invitation: Record<string, number>;
            full_paper_accepted: Record<string, number>; // 新增: 已接受的全文投稿
            still_in_abstract: Record<string, number>;
        }
    >;

    // 初始化所有主題，確保即使沒有提交的主題也會包含在內
    Object.keys(topicList).forEach((topic) => {
        topicAnalytics[topic] = {
            total: 0,
            full_paper_invitation: {
                oral: 0,
                poster: 0,
                undecided: 0,
            },
            full_paper_accepted: {
                // 新增: 已接受的全文投稿
                oral: 0,
                poster: 0,
                undecided: 0,
            },
            still_in_abstract: {
                oral: 0,
                poster: 0,
                undecided: 0,
            },
        };
    });

    // 初始化 ALL 類別
    topicAnalytics["ALL"] = {
        total: 0,
        full_paper_invitation: {
            oral: 0,
            poster: 0,
            undecided: 0,
        },
        full_paper_accepted: {
            // 新增: 已接受的全文投稿
            oral: 0,
            poster: 0,
            undecided: 0,
        },
        still_in_abstract: {
            oral: 0,
            poster: 0,
            undecided: 0,
        },
    };

    // 統計每個提交
    submissions.forEach((sub) => {
        const topic = sub.submissionTopic;

        // 如果是無效主題，歸類為"其他新興科技"
        const validTopic = Object.keys(topicList).includes(topic) ? topic : "其他新興科技";

        // 增加該主題的總量
        topicAnalytics[validTopic].total += 1;

        // 同時增加 ALL 的總量
        topicAnalytics["ALL"].total += 1;

        // 根據提交類型和發表形式分類統計
        const presentType = sub.submissionPresentType || "undecided";
        const isAccepted = sub.submissionStatus === "accepted";

        if (sub.submissionType === "full_paper") {
            // 全文投稿
            topicAnalytics[validTopic].full_paper_invitation[presentType] += 1;
            topicAnalytics["ALL"].full_paper_invitation[presentType] += 1;

            // 如果是已接受的全文投稿，也計入 full_paper_accepted
            if (isAccepted) {
                topicAnalytics[validTopic].full_paper_accepted[presentType] += 1;
                topicAnalytics["ALL"].full_paper_accepted[presentType] += 1;
            }
        } else {
            // 還在摘要階段
            topicAnalytics[validTopic].still_in_abstract[presentType] += 1;
            topicAnalytics["ALL"].still_in_abstract[presentType] += 1;
        }
    });

    // 將分析結果轉換為數組形式
    const analytics = Object.entries(topicAnalytics).map(([topic, stats]) => ({
        topic,
        ...stats,
    }));

    return NextResponse.json({
        analytics,
        submissionCount,
    });
};

export const GET = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
