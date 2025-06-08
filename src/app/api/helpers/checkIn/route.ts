import { middlewareFactory } from "@/lib/middlewareFactory";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { checkInPrototype } from "@/types/user";

const handler = async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isHelper) {
        return NextResponse.json(
            { error: "未授權訪問" },
            {
                status: 401,
            }
        );
    }

    try {
        // 解析請求內容
        const body = await req.json();
        const { uuid, checkInData } = body;

        // 驗證必要參數
        if (!uuid) {
            return NextResponse.json({ error: "缺少用戶UUID" }, { status: 400 });
        }

        if (!checkInData || typeof checkInData !== "object") {
            return NextResponse.json({ error: "簽到資料格式錯誤" }, { status: 400 });
        }

        // 驗證 checkInData 符合 checkInPrototype
        const { date, checkIn } = checkInData as checkInPrototype;
        if (!date || typeof checkIn !== "boolean") {
            return NextResponse.json({ error: "簽到資料缺少必要欄位" }, { status: 400 });
        }

        // 連接資料庫
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // 查找用戶
        const user = await db.collection("users").findOne({ uuid });
        if (!user) {
            return NextResponse.json({ error: "找不到該用戶" }, { status: 404 });
        }

        // 更新用戶的 checkIns 陣列
        // 如果 checkIns 不存在，創建新陣列；如果存在，添加新記錄
        const updatedUser = await db.collection("users").findOneAndUpdate(
            { uuid },
            {
                $push: {
                    checkIns: {
                        ...checkInData,
                        createdAt: new Date(),
                        helper: session.user.email,
                    },
                },
            },
            { returnDocument: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "更新用戶簽到記錄失敗" }, { status: 500 });
        }

        return NextResponse.json(
            {
                success: true,
                message: "簽到成功",
                user: {
                    uuid: user.uuid,
                    checkIns: updatedUser.value?.checkIns || [],
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("簽到過程中發生錯誤:", error);
        return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
    }
};

export const POST = middlewareFactory({ cors: true, auth: true }, handler);
export const OPTIONS = middlewareFactory({ cors: true }, async () => new Response(null));
