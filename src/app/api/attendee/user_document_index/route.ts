// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import clientPromise from "@/lib/mongodb";

// export async function GET(req: NextRequest) {
//     // 驗證使用者是否已登入
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?.email || !session.user?.uuid) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // 連接資料庫
//     const client = await clientPromise;
//     const db = client.db(process.env.MONGODB_DB);
//     const collection = db.collection("users");

//     // 更新資料
//     const result = await collection.findOne({ email: session.user.email });
//     console.log(result.uploaded_pdfs);
//     return NextResponse.json(result.uploaded_pdfs, { status: 200 });
// }

// src/app/api/attendee/user_document_index/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, session: any) => {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("users");

    const result = await collection.findOne({ email: session.user.email });

    return NextResponse.json(result?.uploaded_pdfs || {}, { status: 200 });
};

export const GET = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
