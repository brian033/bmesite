import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import type { User as DBUser } from "@/types/user";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    session: {
        strategy: "jwt" as const,
        maxAge: 60 * 60 * 24 * 7, // JWT 存活時間（秒），這裡是 7 天
        updateAge: 60 * 60 * 24, // 每 24 小時觸發一次自動刷新 JWT
    },

    callbacks: {
        async signIn({ user }) {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);
            const collection = db.collection("users");

            const existing = await collection.findOne({ email: user.email });

            if (!existing) {
                await collection.insertOne({
                    registered: false,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    uuid: uuidv4(),
                    role: "attendee",
                    createdAt: new Date().toISOString(),
                    contact_email: "未輸入聯絡用信箱", // 預設聯絡信箱為使用者的email
                    // additional fields:
                    phone: "未輸入電話", // 預設電話
                    department: "未輸入單位", // 預設部門
                    payment: {
                        paid: false, // 預設未付款
                        payment_id: [], // 預設無付款ID
                    },
                    uploaded_pdfs: {
                        abstracts: [],
                        full_paper: [],
                    },
                    submission: {
                        abstracts: [],
                        full_paper: [],
                    },
                } as DBUser);
            }

            return true;
        },

        async jwt({ token, user }) {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);
            const collection = db.collection("users");

            // const dbUser = await collection.findOne({
            //     email: token.email ?? user?.email,
            // });
            const dbUser = (await collection.findOne({
                email: token.email ?? user?.email,
            })) as DBUser;

            if (dbUser) {
                Object.assign(token as typeof token & Partial<DBUser>, dbUser);
            }
            return token;
        },

        async session({ session, token }) {
            Object.assign(session.user as typeof session.user & Partial<DBUser>, token);
            return session;
        },
        // 簡化版本的 redirect 回調
        async redirect({ url, baseUrl }) {
            // 總是重定向到個人資料頁
            return `${baseUrl}/profile`;
        },
    },
};
