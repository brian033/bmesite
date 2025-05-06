import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { User } from "@/types/user";
import type { Session } from "next-auth";

export type TypedSession = Session & {
    user: User;
};

export async function getTypedSession(): Promise<TypedSession | null> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;

    const user = session.user as User;
    return {
        ...session,
        user: {
            ...user,
            _id: user._id?.toString?.(), // 轉成 string
        },
    };
}
