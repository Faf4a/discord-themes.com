"use cache";

import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const client = await clientPromise;
    const db = client.db("submittedThemesDatabase");
    const themesCollection = db.collection("pending");

    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).json({ message: "Cannot check authorization without unique token" });
    }

    const token = authorization?.replace("Bearer ", "")?.trim() ?? null;

    if (!token) {
        return res.status(400).json({ message: "Invalid Request, unique user token is missing" });
    }
    const user = await isAuthed(token as string);

    if (!user) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }

    if (!user.admin) {
        return res.status(401).json({ status: 401, message: "Given token is not permitted to access this resource" });
    }

    const themes = await themesCollection.find({}).toArray();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=1200");
    res.status(200).json(themes);
}
