import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Cannot check authorization without unique token" });
    }

    const user = await isAuthed(token);

    res.setHeader("Content-Type", "application/json");

    if (!user) {
        res.status(500).json({ status: 404, message: "No user found with those credentials" });
    } else {
        res.status(200).json({ status: 200, user });
    }
}
