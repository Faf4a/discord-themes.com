import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";
import { ObjectId } from "mongodb";
import { validateInvite } from "@utils/extractInvite";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { authorization } = req.headers;
    const { id } = req.query;

    if (!authorization) {
        return res.status(400).json({ message: "Cannot check authorization without unique token" });
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
        return res.status(400).json({ status: 400, message: "Invalid Request, unique user token is missing" });
    }

    const user = await isAuthed(token as string);

    if (!user) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }

    if (!user.admin) {
        return res.status(403).json({ status: 403, message: "Unauthorized" });
    }

    if (!id) {
        return res.status(400).json({
            status: 400,
            message: "Invalid Request - Missing required fields",
            fields: ["id"]
        });
    }

    try {
        const client = await clientPromise;
        const submittedDb = client.db("submittedThemesDatabase");
        const pendingCollection = submittedDb.collection("pending");

        const theme = await pendingCollection.findOne({ _id: new ObjectId(id as string) });

        if (!theme) {
            return res.status(404).json({
                status: 404,
                message: "Theme not found"
            });
        }

        if (theme.state !== "pending") {
            return res.status(400).json({
                status: 400,
                message: "Theme is not pending"
            });
        }

        await pendingCollection.updateOne(
            { _id: new ObjectId(id as string) },
            {
                $set: {
                    state: "rejected",
                    moderator: {
                        discord_snowflake: user.id,
                        discord_name: user.global_name || "",
                        avatar_url: user.avatar || ""
                    }
                },
                $unset: {
                    file: "",
                    fileUrl: "",
                    contributors: "",
                    submittedBy: ""
                }
            }
        );

        return res.status(200).json({ status: 200, title: theme.title, message: "Theme rejected" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error"
        });
    }
}
