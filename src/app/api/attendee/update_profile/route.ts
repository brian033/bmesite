// src/app/api/attendee/update_profile/route.ts
import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/mailTools";

const handler = async (req: NextRequest, session: any) => {
    const allowedFields = [
        "contact_email",
        "name",
        "phone",
        "department",
        "dietary",
        "going_dinner",
    ];
    const data = await req.json();

    for (const key in data) {
        if (!allowedFields.includes(key)) {
            return NextResponse.json({ error: `Invalid field: ${key}` }, { status: 400 });
        }
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("users");

    const VALID_DIETARY_OPTIONS = ["vegan", "non_vegan"] as const;
    const VALID_DINNER_OPTIONS = ["yes", "no"] as const;

    // 驗證 dietary
    if (data.dietary && !VALID_DIETARY_OPTIONS.includes(data.dietary)) {
        return NextResponse.json(
            {
                error: "Invalid dietary option. Must be either 'vegan' or 'non_vegan'.",
            },
            { status: 400 }
        );
    }

    // 驗證 going_dinner
    if (data.going_dinner && !VALID_DINNER_OPTIONS.includes(data.going_dinner)) {
        return NextResponse.json(
            {
                error: "Invalid dinner option. Must be either 'yes' or 'no'.",
            },
            { status: 400 }
        );
    }
    if (data.going_dinner) {
        data.going_dinner = data.going_dinner === "yes";
    }

    const result = await collection.updateOne({ email: session.user.email }, { $set: data });

    if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 400 });
    }

    const updatedUser = await collection.findOne({ email: session.user.email });
    updatedUser.reload = false; // 預設不需要重新載入資料
    // 如果還沒註冊再檢查
    if (!updatedUser.registered) {
        // 🔽 檢查是否所有欄位都已填寫（非 "未輸入"），並設定 registered 為 true
        if (
            updatedUser.contact_email !== "未輸入聯絡用信箱" &&
            updatedUser.department !== "未輸入單位" &&
            typeof updatedUser.going_dinner === "boolean" && // 改用型別檢查
            VALID_DIETARY_OPTIONS.includes(updatedUser.dietary)
        ) {
            await collection.updateOne(
                { email: session.user.email },
                { $set: { registered: true } }
            );
            updatedUser.registered = true; // 同步給前端回傳
            updatedUser.reload = true; // 讓前端知道要重新載入資料
            await sendTemplateEmail(
                "welcome-after-filling-data",
                {
                    name: updatedUser.name,
                    email: updatedUser.contact_email,
                    department: updatedUser.department,
                },
                {
                    to: updatedUser.contact_email,
                    subject: "感謝報名2025農機與生機學術研討會",
                }
            );
        }
    } else {
        // 如果已經註冊過，然後他改的是聯絡信箱，則發送通知信
        if (data.contact_email) {
            await sendTemplateEmail(
                "email-check",
                {
                    name: updatedUser.name,
                    email: data.contact_email,
                },
                {
                    to: data.contact_email,
                    subject: "您的聯絡信箱已更新",
                }
            );
        }
    }

    return NextResponse.json({ success: true, updatedUser });
};

// ✅ 使用 middlewareFactory：登入驗證 + CORS 開啟
export const PUT = middlewareFactory({ cors: true, auth: true }, handler);

// ✅ 別忘了 preflight for CORS
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
