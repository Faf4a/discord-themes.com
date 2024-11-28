"use cache";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const { name } = req.query as { name: string };
    const decodedName = decodeURIComponent(name);

    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=1200");

    // redirect to https://cdn.discord-themes.com/theme/NAME (status code permanent)
    res.redirect(301, `https://cdn.discord-themes.com/theme/${decodedName}`);
}
