// // src/app/api/attendee/user_document_index/route.ts
// import { middlewareFactory } from "@/lib/middlewareFactory";
// import clientPromise from "@/lib/mongodb";
// import { NextRequest, NextResponse } from "next/server";

// const handler = async (req: NextRequest, session: any) => {
//     const client = await clientPromise;
//     const db = client.db(process.env.MONGODB_DB);
//     const userDB = db.collection("users");
//     const documentsDB = db.collection("documents");
//     const submissionDB = db.collection("submissions");
//     const user = await userDB.findOne({ email: session.user.email });
//     if (!user) {
//         return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }
//     const uploadedPdfs = user.uploaded_pdfs || {};
//     const result: Record<string, any> = { submissions: {} };

//     for (const pdfType of Object.keys(uploadedPdfs)) {
//         const files = uploadedPdfs[pdfType];
//         const pdfIds = files.map((f: any) => f.pdfId);

//         // 批次查找文件
//         const docs = await documentsDB.find({ documentId: { $in: pdfIds } }).toArray();
//         const docMap = new Map(docs.map((d) => [d.documentId, d]));

//         // 批次查找審查案件
//         const submissions = user.submission[pdfType];
//         const submissionList = await submissionDB
//             .find({ submissionId: { $in: submissions } })
//             .toArray();

//         result.submissions[pdfType] = submissionList;

//         // 加入 detailedInfo
//         result[pdfType] = files.map((file: any) => {
//             const matchedSubmission = submissionList.find((s) =>
//                 s.submissionFiles.includes(file.pdfId)
//             );
//             return {
//                 ...file,
//                 detailedInfo: docMap.get(file.pdfId) || null,
//                 submissionInfo: matchedSubmission
//                     ? {
//                           submissionId: matchedSubmission.submissionId,
//                           submissionStatus: matchedSubmission.submissionStatus,
//                           submissionUpdatedAt: matchedSubmission.submissionUpdatedAt,
//                       }
//                     : null,
//             };
//         });
//     }
//     return NextResponse.json(result, { status: 200 });
//     // return NextResponse.json(result?.uploaded_pdfs || {}, { status: 200 });
// };

// export const GET = middlewareFactory({ cors: true, auth: true }, handler);
// export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));

// refactor
// src/app/api/attendee/user_document_index/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
import { User } from "@/types/user";
// 定義返回類型
type UserDocumentIndexSuccessResponse = {
    documents: Document[]; // 所有 owner == user 的文件
    submissions: Submission[]; // 所有 owner == user 的審查案件
};

type UserDocumentIndexErrorResponse = {
    error: string; // 錯誤訊息
};

export type UserDocumentIndexResponse =
    | UserDocumentIndexSuccessResponse
    | UserDocumentIndexErrorResponse;

const handler = async (
    req: NextRequest,
    session: any
): Promise<NextResponse<UserDocumentIndexResponse>> => {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const userDB = db.collection("users");
    const documentsDB = db.collection("documents");
    const submissionDB = db.collection("submissions");

    // 查找用戶
    const user = (await userDB.findOne({ email: session.user.email })) as User;
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 查找文件和審查案件
    const documents = (await documentsDB
        .find({ documentOwner: user.uuid })
        .toArray()) as Document[];
    const submissions = (await submissionDB
        .find({ submissionOwner: user.uuid })
        .toArray()) as Submission[];

    // 返回成功結果
    return NextResponse.json(
        {
            documents,
            submissions,
        },
        { status: 200 }
    );
};

export const GET = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
