// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import clientPromise from "@/lib/mongodb";

// export async function PUT(req: NextRequest) {
//     // 驗證使用者是否已登入
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?.email || !session.user?.uuid) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // 只允許修改以下欄位
//     const allowedFields = ["name", "phone", "address", "department"];
//     const data = await req.json();

//     // 驗證資料是否只包含允許的欄位
//     for (const key in data) {
//         if (!allowedFields.includes(key)) {
//             return NextResponse.json({ error: `Invalid field: ${key}` }, { status: 400 });
//         }
//     }

//     // 連接資料庫
//     const client = await clientPromise;
//     const db = client.db(process.env.MONGODB_DB);
//     const collection = db.collection("users");

//     // 更新資料
//     const result = await collection.updateOne({ email: session.user.email }, { $set: data });

//     if (result.modifiedCount === 0) {
//         return NextResponse.json({ error: "Failed to update profile" }, { status: 400 });
//     }

//     // 返回成功更新的資料
//     const updatedUser = await collection.findOne({ email: session.user.email });
//     return NextResponse.json({ success: true, updatedUser });
// }

// src/app/api/attendee/edit-profile/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, session: any) => {
    const allowedFields = ["name", "phone", "address", "department"];
    const data = await req.json();

    for (const key in data) {
        if (!allowedFields.includes(key)) {
            return NextResponse.json({ error: `Invalid field: ${key}` }, { status: 400 });
        }
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("users");

    const result = await collection.updateOne({ email: session.user.email }, { $set: data });

    if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 400 });
    }

    const updatedUser = await collection.findOne({ email: session.user.email });

    return NextResponse.json({ success: true, updatedUser });
};

// ✅ 使用 middlewareFactory：登入驗證 + CORS 開啟
export const PUT = middlewareFactory({ cors: true, auth: true }, handler);

// ✅ 別忘了 preflight for CORS
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
