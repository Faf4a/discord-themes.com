import clientPromise from "@utils/db";
import { isAuthed } from "@utils/auth";
import type { NextApiRequest, NextApiResponse } from "next";

interface LikeEntry {
    themeId: number;
    userIds: string[];
    hasLiked?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }
    const client = await clientPromise;
    const db = client.db("themesDatabase");
    const likesCollection = db.collection("likes");

    try {
        const likes = (await likesCollection.find({}).toArray()) as unknown as LikeEntry[];

        const { token } = req.body;

        if (token) {
            const user = await isAuthed(token);
            if (user) {
                const processedLikes = likes.map((like: LikeEntry) => ({
                    themeId: like.themeId,
                    likes: like.userIds.length,
                    hasLiked: like.userIds.includes(user.id)
                }));
                return res.status(200).json({
                    status: 200,
                    likes: processedLikes
                });
            }
        }

        const simpleLikes = likes.map((like: LikeEntry) => ({
            themeId: like.themeId,
            likes: like.userIds.length
        }));

        return res.status(200).json({
            status: 200,
            likes: simpleLikes
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}
