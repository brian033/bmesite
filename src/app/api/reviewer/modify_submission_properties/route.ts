import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Submission } from "@/types/submission";
import { sendTemplateEmail } from "@/lib/mailTools";

const submissionSerialRules = {
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
    其他新興科技: "K",
};
export const getSerial = (
    submissionPresentType: "oral" | "poster",
    submisssionTopic: string,
    submission_Id: string
) => {
    // submission Serial規則: [字母]+submissionId第一個part轉成數字後的前10位數字
    const present_type = submissionPresentType == "oral" ? "O" : "P";
    const prefix = submissionSerialRules[submisssionTopic || "其他新興科技"];
    const submissionIdPart = submission_Id.split("-")[0]; // 取UUID的第一個部分
    const numericValue = BigInt(`0x${submissionIdPart}`); // 將其轉為數字
    const serial = numericValue.toString().padStart(10, "0").slice(0, 10); // 取前10位並pad 0
    return `${present_type}${prefix ? prefix : "X"}${serial}`;
};

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
        // calculate serial first
        const oldSerial = getSerial(
            submission.submissionPresentType,
            submission.submissionTopic,
            submission.submissionId
        );
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
        if (updateResult.modifiedCount > 0) {
            // notify user on the update
            const userRes = await db
                .collection("users")
                .findOne({ uuid: submission.submissionOwner });
            await sendTemplateEmail(
                "sub-properties-update",
                {
                    name: userRes.name,
                    title: submission.submissionTitle,
                    oldSerial: oldSerial,
                    newSerial: getSerial(
                        submissionType as "oral" | "poster",
                        submissionTopic,
                        submission.submissionId
                    ),
                    presentationType:
                        (submissionType as "oral" | "poster") === "oral" ? "口頭發表" : "海報發表",
                    presentationTopic: submissionTopic,
                },
                {
                    to: userRes.contact_email,
                    subject: "2025農機與生機學術研討會-審稿案更新通知",
                }
            );
        }

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
