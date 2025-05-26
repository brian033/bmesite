// ✅ src/app/api/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid"; // 引入 uuid 用來生成唯一的 pdfId
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";

// post handler to upload file to a submission by user.
const handler = async (req: NextRequest, session: any) => {
    // 從表單數據中提取文件和 pdf 類型
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const submissionId = formData.get("submissionId") as string | null;

    // 檢查檔案是否存在
    if (!file || !file.name || file.size === 0) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // 撈取 sumbission
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const submission: Submission = (await db
        .collection("submissions")
        .findOne({ submissionId: submissionId })) as Submission;
    if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 檢查使用者是否有權限上傳文件 1. 看他是不是Owner
    if (submission.submissionOwner === session.user.uuid) {
        // 如果 submissionStatus是rejected的話，則不給更新文件
        if (submission.submissionStatus === "rejected") {
            return NextResponse.json(
                { error: "Cannot update file for rejected submission" },
                { status: 403 }
            );
        }
        // 是pending的話，不給更新文件
        if (submission.submissionStatus === "pending") {
            return NextResponse.json(
                { error: "Cannot update file for pending cases" },
                { status: 403 }
            );
        }
        // 如果他是full paper的話，那full paper的appoved的話，不給更新文件。
        if (
            submission.submissionType == "full_paper" &&
            submission.submissionStatus === "approved"
        ) {
            return NextResponse.json(
                { error: "Cannot update file for approved full paper" },
                { status: 403 }
            );
        }
    } else if (session.user.role !== "admin" && session.user.role !== "reviewer") {
        return NextResponse.json(
            { error: "Forbidden, you cannot upload files for this submission" },
            { status: 403 }
        );
    }

    // 檢查檔案是否是 PDF 檔案  when it's abstracts, 其他時候只允許word
    const fileExt = path.extname(file.name).toLowerCase();
    // if (submission.submissionType === "abstracts") {
    //     if (fileExt !== ".pdf") {
    //         return NextResponse.json(
    //             { error: "Only PDF files are allowed on absstracts submission" },
    //             { status: 400 }
    //         );
    //     }
    // } else {
    //     if (fileExt !== ".docx" && fileExt !== ".doc") {
    //         return NextResponse.json(
    //             { error: "Only Word files are allowed on full paper submission" },
    //             { status: 400 }
    //         );
    //     }
    // }
    if (fileExt !== ".docx" && fileExt !== ".doc" && fileExt !== ".pdf") {
        return NextResponse.json(
            { error: "Only Word files and pdf files are allowed on submissions " },
            { status: 400 }
        );
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "uploads", session.user.uuid, "submission_update");
    // 創建目錄
    await fs.mkdir(uploadDir, { recursive: true });

    // 讀取檔案並儲存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // 儲存相對路徑到資料庫
    const relativePath = `/submission_update/${fileName}`;
    const pdfId = uuidv4(); // 生成唯一的 pdfId
    const upLoadTime = new Date().toISOString();

    // 推一個document到資料庫
    const doc: Document = {
        documentId: pdfId,
        documentLocation: `/${session.user.uuid}${relativePath}`,
        documentOwner: submission.submissionOwner,
        documentStatus: "pending",
        title: submission.submissionTitle,
        pdfType: submission.submissionType,
        description: description || "submission update",
        notes: [],
        createdAt: upLoadTime,
        topic: submission.submissionTopic, // <-- 新欄位
        present_type: submission.submissionPresentType, // <-- 新增欄位
    };

    // 更新submission的document
    await db.collection("submissions").updateOne(
        { submissionId: submissionId },
        {
            $set: {
                submissionStatus: "pending",
                submissionUpdatedAt: upLoadTime,
            },
            $push: {
                submissionFiles: pdfId,
            },
        }
    );

    await db.collection("documents").insertOne(doc as any);

    return NextResponse.json({ success: true, filePath: relativePath });
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
