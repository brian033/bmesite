import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

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
                    createdAt: new Date(),
                    contact_email: "未輸入聯絡用信箱", // 預設聯絡信箱為使用者的email
                    // additional fields:
                    phone: "未輸入電話", // 預設電話
                    department: "未輸入單位", // 預設部門
                    payment: {
                        paid: false, // 預設未付款
                        payment_id: "None", // 預設無付款ID
                    },
                    uploaded_pdfs: {
                        abstracts: [],
                        full_paper: [],
                    },
                    submission: {
                        abstracts: [],
                        full_paper: [],
                    },
                });
            }

            return true;
        },

        async jwt({ token, user }) {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);
            const collection = db.collection("users");

            const dbUser = await collection.findOne({
                email: token.email ?? user?.email,
            });

            if (dbUser) {
                token.registered = dbUser.registered;
                token.name = dbUser.name;
                token.role = dbUser.role;
                token.uuid = dbUser.uuid;
                token.email = dbUser.email;
                token.contact_email = dbUser.contactEmail; // 新增 contactEmail
                token.image = dbUser.image;
                token.phone = dbUser.phone; // 新增 phone
                token.department = dbUser.department; // 新增 department
                token.payment = dbUser.payment; // 新增 payment
                token.uploaded_pdfs = dbUser.uploaded_pdfs; // 新增 uploaded_pdfs
                token.submission = dbUser.submission; // 新增 submission
            }

            return token;
        },

        async session({ session, token }) {
            session.user.registered = token.registered;
            session.user.name = token.name;
            session.user.role = token.role;
            session.user.uuid = token.uuid;
            session.user.contact_email = token.contactEmail; // 新增 contactEmail
            session.user.email = token.email;
            session.user.image = token.image;
            session.user.phone = token.phone; // 新增 phone
            session.user.department = token.department; // 新增 department
            session.user.payment = token.payment; // 新增 payment
            session.user.uploaded_pdfs = token.uploaded_pdfs; // 新增 uploaded_pdfs
            token.submission = token.submission; // 新增 submission
            return session;
        },
    },
};
