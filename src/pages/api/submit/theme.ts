import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";
import { DEV_SERVER, SERVER } from "@constants";
import { UserData } from "@types";

const WEBHOOK_SUBMISSION_URL = process.env.WEBHOOK_SUBMISSIONS;
const WEBHOOK_IMG_UPLOADER_URL = process.env.WEBHOOK_IMG_UPLOADER;

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed", wants: "POST" });
    }

    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).json({ message: "Cannot check authorization without unique token" });
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
        return res.status(400).json({ status: 400, message: "Invalid Request, unique user token is missing" });
    }

    const requiredFields = ["title", "shortDescription", "longDescription", "sourceLink", "validatedUsers"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Invalid Request - Missing required fields",
            fields: missingFields
        });
    }

    const user = await isAuthed(token as string);

    if (!user) {
        return res.status(401).json({ status: 401, message: "Given token is not authorized" });
    }

    try {
        const client = await clientPromise;
        const db = client.db("submittedThemesDatabase");
        const themesCollection = db.collection("pending");

        const submission = {
            ...req.body,
            submittedAt: new Date(),
            submittedBy: user.id
        };

        const item = await themesCollection.insertOne(submission);
        const id = item.insertedId;

        try {
            const webhookBody = {
                embeds: [
                    {
                        title: "New Theme Submission",
                        description: `**Title:** ${req.body.title}\n**Type:** ${req.body.type}\n**Author:** ${
                            Object.values(req.body.validatedUsers)
                                .map((user: UserData) => `${user.username} (${user.id})`)
                                .join(", ") || "No contributors listed"
                        }\n**Description:** ${req.body.shortDescription}`,
                        fields: [
                            {
                                name: "Source Link",
                                value: req.body.sourceLink
                            },
                            {
                                name: "Dashboard",
                                value: `[Approve](${SERVER}/admin/theme/${id}/approve) | [Reject](${SERVER}/admin/theme/${id}/reject)\n[View](${SERVER}/theme/${id})`
                            }
                        ],
                        footer: {
                            text: `${id}`
                        }
                    }
                ]
            };

            if (SERVER === DEV_SERVER) {
                webhookBody.embeds[0].fields.push({
                    name: "Test Submission",
                    value: "This is a test submission, do not take action on this"
                });
            }

            if (req.body.file) {
                try {
                    const base64Data = req.body.file.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, "base64");

                    const form = new FormData();
                    form.append("file", new Blob([buffer]), "theme-preview.png");

                    const uploadResponse = await fetch(WEBHOOK_IMG_UPLOADER_URL, {
                        method: "POST",
                        body: form
                    });

                    const uploadData = await uploadResponse.json();

                    // @ts-ignore
                    webhookBody.embeds[0].image = {
                        url: uploadData.attachments[0].url
                    };
                } catch (error) {
                    return res.status(500).json({
                        status: 500,
                        message: "Failed to process submission"
                    });
                }
            }
            const response = await fetch(WEBHOOK_SUBMISSION_URL as string, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(webhookBody)
            });

            if (!response.ok) {
                return console.error("Webhook request failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    body: await response.text()
                });
            }
        } catch (error) {
            console.error("Webhook request failed:", error);
            return res.status(500).json({});
        }
        res.status(200).json({ status: 200, id });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to process submission"
        });
    }
}
