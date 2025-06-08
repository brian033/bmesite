import QRScanner from "./components/QRScanner";
import ManualCheckIn from "./components/ManualCheckIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { User } from "@/types/user";
import clientPromise from "@/lib/mongodb";

export type CheckInUser = Pick<
    User,
    "uuid" | "department" | "payment" | "dietary" | "going_dinner" | "name" | "checkIns"
>;

export default async function Page() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isHelper) {
        redirect("/");
    }

    // 連接資料庫
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 只撈出指定的欄位
    const userData = await db
        .collection("users")
        .find(
            {},
            {
                projection: {
                    uuid: 1,
                    name: 1,
                    department: 1,
                    payment: 1,
                    dietary: 1,
                    going_dinner: 1,
                    checkIns: 1,
                    _id: 0, // 排除 _id 欄位
                },
            }
        )
        .toArray();

    // 將資料轉換為 CheckInUser 類型
    const checkInUsers: CheckInUser[] = userData.map((user) => ({
        uuid: user.uuid,
        department: user.department,
        payment: user.payment,
        dietary: user.dietary,
        going_dinner: user.going_dinner,
        name: user.name,
        checkIns: user.checkIns,
    }));

    return (
        <div>
            <ManualCheckIn users={checkInUsers} />
            <QRScanner users={checkInUsers} />
        </div>
    );
}
