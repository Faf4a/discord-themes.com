import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { title, description, content, version, type, attribution, screenshotMetadata } = req.body;
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).json({ message: "Cannot check authorization without unique token" });
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
        return res.status(400).json({ status: 400, message: "Invalid Request, unique user token is missing" });
    } else if (!content || !title || !description || !version || !type) {
        return res.status(400).json({ status: 400, message: "Invalid Request" });
    }

    const user = await isAuthed(token as string);

    if (!user) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }

    const client = await clientPromise;
    const db = client.db("submittedThemesDatabase");

    const themesCollection = db.collection("pending");

    // title, content, version, type, attribution, screenshotMetadata
    await themesCollection.insertOne({
        title,
        description,
        version,
        type,
        author: attribution.contributors,
        content,
        screenshotMetadata
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ status: 200 });
}
