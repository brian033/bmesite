// // ✅ src/app/api/attendee/update-profile/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import clientPromise from "@/lib/mongodb";
// import path from "path";
// import fs from "fs/promises";

// export async function POST(req: NextRequest) {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user?.email || !session.user?.uuid) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const formData = await req.formData();
//     const file = formData.get("file") as File | null;

//     if (!file || !file.name || file.size === 0) {
//         return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const ext = path.extname(file.name);
//     const timestamp = Date.now();
//     const fileName = `${timestamp}${ext}`;
//     const uploadDir = path.join(process.cwd(), "uploads", session.user.uuid, "pfp");

//     await fs.mkdir(uploadDir, { recursive: true });
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const filePath = path.join(uploadDir, fileName);
//     await fs.writeFile(filePath, buffer);

//     const relativePath = `/pfp/${fileName}`;

//     const client = await clientPromise;
//     const db = client.db(process.env.MONGODB_DB);
//     await db
//         .collection("users")
//         .updateOne({ email: session.user.email }, { $set: { image: relativePath } });

//     return NextResponse.json({ success: true, image: relativePath });
// }

// src/app/api/attendee/update-profile/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import path from "path";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, session: any) => {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.name || file.size === 0) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.name);
    const timestamp = Date.now();
    const fileName = `${timestamp}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads", session.user.uuid, "pfp");

    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const relativePath = `/pfp/${fileName}`;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    await db
        .collection("users")
        .updateOne({ email: session.user.email }, { $set: { image: relativePath } });

    return NextResponse.json({ success: true, image: relativePath });
};

// ✅ 只驗證登入 + CORS
export const POST = middlewareFactory({ cors: true, auth: true }, handler);

// ✅ 處理 CORS preflight
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
