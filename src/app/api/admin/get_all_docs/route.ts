// src/app/api/admin/get_all_docs/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const handler = async (req: NextRequest, session: any) => {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const docs = await db.collection("documents").find({}).toArray();

        return NextResponse.json(docs, { status: 200 });
    } catch (err) {
        console.error("Error fetching documents:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

export const GET = middlewareFactory({ cors: true, auth: true, role: ["admin"] }, handler);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
