import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@utils/db";
import { SERVER } from "@constants";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { token, userId } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Cannot get themes without unique token" });
    }

    const authResponse = await fetch(SERVER + "/api/user/isAuthed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    let authRequest;
    try {
        authRequest = await authResponse.json();
    } catch (error) {
        return res.status(500).json({ message: "Failed to parse authentication response" });
    }

    if (!authRequest.authenticated) {
        return res.status(401).json({ message: "User is not authorized" });
    }

    if (!userId) {
        return res.status(400).json({ message: "Cannot get themes without user id" });
    }

    const client = await clientPromise;
    const db = client.db("themesDatabase");
    const users = db.collection("users");

    let requestedUser;

    if (userId === "@me") {
        const userEntry = await users.findOne({ "user.key": token });
        if (!userEntry) return res.status(404).json({ status: 400, message: "No user found with those credentials" });
        delete userEntry.user.key;
        delete userEntry._id;
        userEntry.user.current = true;
        requestedUser = userEntry?.user;
    } else {
        const userEntry = await users.findOne({ "user.id": String(userId) });
        if (!userEntry) return res.status(404).json({ status: 400, message: "No user found with those credentials" });
        delete userEntry.user.key;
        delete userEntry._id;
        userEntry.user.current = false;
        requestedUser = userEntry?.user;
    }

    const themes = db.collection("themes");
    const userThemes = await themes.find({ "author.discord_snowflake": String(requestedUser.id) }).toArray();

    res.setHeader("Content-Type", "application/json");

    if (!userThemes) {
        res.status(400).json({ status: 400, message: "No themes found for that user" });
    } else {
        res.status(200).json({ status: 200, themes: userThemes, user: requestedUser });
    }
}
