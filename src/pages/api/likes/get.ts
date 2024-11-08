import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    res.setHeader("Content-Type", "application/json");

    const client = await clientPromise;
    const db = client.db("themesDatabase");
    const likesCollection = db.collection("likes");

    try {
        const likes = await likesCollection.find({}, { projection: { _id: 0 } }).toArray();

        res.status(200).json({ status: 200, totalEntries: likes.length, likes });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}
