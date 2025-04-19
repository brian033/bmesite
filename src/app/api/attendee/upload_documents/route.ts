// ✅ src/app/api/attendee/upload_documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid"; // 引入 uuid 用來生成唯一的 pdfId

// 可接受的 pdftype 類型
const validPdfTypes = ["abstracts", "full_paper"];

const handler = async (req: NextRequest, session: any) => {
    // 從表單數據中提取文件和 pdf 類型
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const note = formData.get("note") as string | null;
    const pdftype = formData.get("pdftype") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
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

    // 插入新文件到 documents collection
    await db.collection("documents").insertOne({
        documentId: pdfId,
        documentLocation: `/${session.user.uuid}${relativePath}`,
        documentOwner: session.user.uuid,
        documentStatus: "uploaded",
        title: title,
        pdfType: pdftype,
        description: description || "",
        reviewedBy: [],
        notes: [],
        createdAt: upLoadTime,
    });

    return NextResponse.json({ success: true, filePath: relativePath });
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
