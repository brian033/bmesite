import { ObjectId } from "mongodb";

export type Announcement = {
    _id?: ObjectId | string;
    title: string;
    lines: string[];
};
