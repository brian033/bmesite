// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
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
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user }) {
            const client = await clientPromise;
            const db = client.db(process.env.MONGODB_DB);
            const collection = db.collection("users");

            const existing = await collection.findOne({ email: user.email });

            if (!existing) {
                await collection.insertOne({
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    uuid: uuidv4(),
                    role: "attendee",
                    createdAt: new Date(),

                    // additional fields:
                    phone: "未輸入電話", // 預設電話
                    address: "未輸入地址", // 預設地址
                    department: "未輸入單位", // 預設部門
                    payment: {
                        paid: false, // 預設未付款
                        payment_id: "None", // 預設無付款ID
                    },
                    uploaded_pdfs: {
                        abstracts: [],
                        final_paper: [],
                        poster: [],
                        others: [],
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
                token.name = dbUser.name;
                token.role = dbUser.role;
                token.uuid = dbUser.uuid;
                token.email = dbUser.email;
                token.image = dbUser.image;
                token.phone = dbUser.phone; // 新增 phone
                token.address = dbUser.address; // 新增 address
                token.department = dbUser.department; // 新增 department
                token.payment = dbUser.payment; // 新增 payment
                token.uploaded_pdfs = dbUser.uploaded_pdfs; // 新增 uploaded_pdfs
            }

            return token;
        },

        async session({ session, token }) {
            session.user.name = token.name;
            session.user.role = token.role;
            session.user.uuid = token.uuid;
            session.user.email = token.email;
            session.user.image = token.image;
            session.user.phone = token.phone; // 新增 phone
            session.user.address = token.address; // 新增 address
            session.user.department = token.department; // 新增 department
            session.user.payment = token.payment; // 新增 payment
            session.user.uploaded_pdfs = token.uploaded_pdfs; // 新增 uploaded_pdfs
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
