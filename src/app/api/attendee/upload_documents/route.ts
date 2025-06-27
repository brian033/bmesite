// ✅ src/app/api/attendee/upload_documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid"; // 引入 uuid 用來生成唯一的 pdfId
import { Document } from "@/types/document";

// 可接受的 pdftype 類型
const validPdfTypes = ["abstracts", "full_paper"];

const handler = async (req: NextRequest, session: any) => {
    // 從表單數據中提取文件和 pdf 類型
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const pdftype = formData.get("pdftype") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const topic = formData.get("topic") as string | null;
    const presentType = formData.get("presentType") as "oral" | "poster";

    // 檢查檔案是否存在
    if (!file || !file.name || file.size === 0) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 檢查 pdftype 是否有效
    if (!pdftype || !validPdfTypes.includes(pdftype)) {
        return NextResponse.json({ error: `Invalid pdf type: ${pdftype}` }, { status: 400 });
    }

    // 檢查檔案是否是 PDF 檔案
    const fileExt = path.extname(file.name).toLowerCase();
    if (fileExt !== ".pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "uploads", session.user.uuid, pdftype);

    // 創建目錄
    await fs.mkdir(uploadDir, { recursive: true });

    // 讀取檔案並儲存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // 儲存相對路徑到資料庫
    const relativePath = `/${pdftype}/${fileName}`;

    const pdfId = uuidv4(); // 生成唯一的 pdfId

    const client = await clientPromise;
    const upLoadTime = new Date().toISOString();
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("users").updateOne(
        { email: session.user.email },
        {
            $push: {
                [`uploaded_pdfs.${pdftype}`]: {
                    pdf: relativePath,
                    uploadedAt: upLoadTime,
                    documentType: pdftype,
                    pdfId: pdfId, // 新增 pdfId
                    title: title,
                    description: description || "",
                },
            },
        }
    );
    const validTopicList = [
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
        "農機安全", // <-- 新欄位
        "其他新興科技",
    ];
    // add typeguard for topic, topic needs to be one of the validTopicList else we'll just return error
    if (topic && !validTopicList.includes(topic)) {
        return NextResponse.json({ error: `Invalid topic: ${topic}` }, { status: 400 });
    }
    const doc: Omit<Document, "_id"> = {
        documentId: pdfId,
        documentLocation: `/${session.user.uuid}${relativePath}`,
        documentOwner: session.user.uuid,
        documentStatus: "uploaded",
        title: title!,
        pdfType: pdftype as "abstracts" | "full_paper",
        description: description || "",
        notes: [],
        createdAt: upLoadTime,
        topic: topic as
            | "生物產業機械"
            | "生物生產工程"
            | "畜牧自動化與污染防治"
            | "農業設施與環控工程"
            | "生物機電控制"
            | "生醫工程與微奈米機電"
            | "生物資訊與系統"
            | "能源與節能技術"
            | "AI與大數據分析"
            | "精準農業智動化"
            | "農機安全" // <-- 新欄位
            | "其他新興科技", // <-- 新欄位
        present_type: presentType, // <-- 新增欄位
    };

    await db.collection("documents").insertOne(doc);

    return NextResponse.json({ success: true, message: "文件上傳成功", document: doc });
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
