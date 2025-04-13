// src/app/api/reviewer/get_docs_by_status/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const handler = async (req: NextRequest, session: any) => {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        if (!status) {
            return NextResponse.json({ error: "Missing status query parameter" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const docs = await db.collection("documents").find({ documentStatus: status }).toArray();

        return NextResponse.json(docs, { status: 200 });
    } catch (err) {
        console.error("Error fetching documents:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

export const GET = middlewareFactory(
    { cors: true, auth: true, role: ["admin", "reviewer"] },
    handler
);

export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
