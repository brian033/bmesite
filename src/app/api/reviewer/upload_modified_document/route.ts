import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";

const handler = async (req: NextRequest, session: any) => {
    // 檢查使用者是否為 reviewer 或 admin
    if (session.user.role !== "admin" && session.user.role !== "reviewer") {
        return NextResponse.json({ error: "只有審稿者和管理員可以使用此功能" }, { status: 403 });
    }

    // 從表單數據中提取文件和相關信息
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const submissionId = formData.get("submissionId") as string | null;

    // 檢查檔案是否存在
    if (!file || !file.name || file.size === 0) {
        return NextResponse.json({ error: "未上傳檔案" }, { status: 400 });
    }

    if (!submissionId) {
        return NextResponse.json({ error: "缺少審稿案 ID" }, { status: 400 });
    }

    // 撈取 submission
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const submission: Submission = (await db
        .collection("submissions")
        .findOne({ submissionId: submissionId })) as Submission;

    if (!submission) {
        return NextResponse.json({ error: "找不到指定的審稿案" }, { status: 404 });
    }

    // 檢查檔案類型 - 維持與原始規則相同
    const fileExt = path.extname(file.name).toLowerCase();

    if (fileExt !== ".docx" && fileExt !== ".doc" && fileExt !== ".pdf") {
        return NextResponse.json(
            { error: "Only Word files and pdf files are allowed" },
            { status: 400 }
        );
    }

    // 用審稿案持有者的目錄存檔案
    const timestamp = Date.now();
    const fileName = `${timestamp}${fileExt}`;
    const uploadDir = path.join(
        process.cwd(),
        "uploads",
        submission.submissionOwner,
        "submission_update",
        "reviewerUpdate"
    );

    // 創建目錄
    await fs.mkdir(uploadDir, { recursive: true });

    // 讀取檔案並儲存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const relativePath = `/submission_update/reviewerUpdate/${fileName}`;
    const pdfId = uuidv4(); // 生成唯一的 pdfId
    const upLoadTime = new Date().toISOString();

    // 在描述中標記此文件為審稿者修改版本
    const docDescription = description
        ? `[審稿者修改] ${description}`
        : `[審稿者修改] 由 ${session.user.name || "審稿者"} 上傳的修改版本`;

    // 推一個document到資料庫，但標記為審稿者上傳
    const doc: Document = {
        documentId: pdfId,
        documentLocation: `/${submission.submissionOwner}${relativePath}`,
        documentOwner: submission.submissionOwner, // 改為審稿者自己是文件擁有者
        documentStatus: "pending", // 不改變現有狀態
        title: `[審稿者版本] ${submission.submissionTitle}`,
        pdfType: submission.submissionType,
        description: docDescription,
        notes: [],
        createdAt: upLoadTime,
        topic: submission.submissionTopic,
        present_type: submission.submissionPresentType,
        // 添加明確標記
        isReviewerUpload: true,
        reviewerId: session.user.uuid,
        reviewerName: session.user.name,
        originalSubmissionId: submissionId,
    };

    // 將文件添加到審稿案，但不更改狀態
    await db.collection("submissions").updateOne(
        { submissionId: submissionId },
        {
            $set: {
                submissionUpdatedAt: upLoadTime, // 更新最後修改時間
            },
            $push: {
                submissionFiles: pdfId, // 添加到現有文件列表
            },
        }
    );

    await db.collection("documents").insertOne(doc as any);

    return NextResponse.json({
        success: true,
        document: doc,
        message: "審稿者修改文件已成功上傳",
    });
};

export const POST = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
