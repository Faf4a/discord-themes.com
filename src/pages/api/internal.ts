"use cache";

import clientPromise from "@utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthed } from "@utils/auth";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

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
        return res.status(401).json({ status: 401, message: "Missing permissions to access route" });
    }

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const agg = [
        {
            $facet: {
                totalUsers: [{ $count: "total" }],
                monthlyUsers: [{ $match: { createdAt: { $gte: firstDayOfMonth } } }, { $count: "total" }],
                totalThemes: [{ $count: "total" }]
            }
        }
    ];

    const client = await clientPromise;
    const db = client.db("themesDatabase");

    const usersColl = db.collection("users");
    const themesColl = db.collection("themes");
    const likesColl = db.collection("likes");

    const usersCursor = usersColl.aggregate(agg);
    const usersResult = await usersCursor.toArray();

    const themesCursor = themesColl.aggregate([{ $count: "total" }]);
    const themesResult = await themesCursor.toArray();

    const authorAgg = [
        {
            $group: {
                _id: "$author.discord_snowflake",
                themeCount: { $sum: 1 }
            }
        },
        { $sort: { themeCount: -1 } },
        { $limit: 1 },
        {
            $lookup: {
                from: "themes",
                localField: "_id",
                foreignField: "author.discord_snowflake",
                as: "themes"
            }
        }
    ];

    const authorCursor = themesColl.aggregate(authorAgg);
    const authorResult = await authorCursor.toArray();
    const topAuthor = authorResult[0] || { _id: null, themeCount: 0, themes: [] };

    const downloadsAgg = [
        {
            $group: {
                _id: null,
                totalDownloads: { $sum: "$downloads" }
            }
        }
    ];

    const downloadsCursor = themesColl.aggregate(downloadsAgg);
    const downloadsResult = await downloadsCursor.toArray();
    const totalDownloads = downloadsResult[0]?.totalDownloads || 0;

    const likesAgg = [
        {
            $project: {
                themeId: 1,
                likesCount: { $size: "$userIds" }
            }
        },
        { $sort: { likesCount: -1 } },
        { $limit: 1 },
        {
            $project: {
                _id: 0,
                themeId: 1
            }
        }
    ];

    const likesCursor = likesColl.aggregate(likesAgg);
    const likesResult = await likesCursor.toArray();
    const mostLikedTheme = likesResult[0]?.themeId || null;

    const totalUsers = usersResult[0].totalUsers[0]?.total || 0;
    const monthlyUsers = usersResult[0].monthlyUsers[0]?.total || 0;
    const totalThemes = themesResult[0]?.total || 0;

    const dbStats = await db.stats();
    const serverStatus = await db.command({ serverStatus: 1 });

    const data = {
        users: {
            monthly: {
                count: monthlyUsers,
                timeframe: `${firstDayOfMonth.toISOString()}-${currentDate.toISOString()}`
            },
            total: totalUsers
        },
        themes: {
            total: totalThemes,
            totalDownloads: totalDownloads,
            topAuthor: {
                discord_snowflake: topAuthor._id,
                themeCount: topAuthor.themeCount
            },
            mostLiked: mostLikedTheme
        },
        dbst: {
            collections: dbStats.collections,
            objects: dbStats.objects,
            dataSize: dbStats.dataSize,
            storageSize: dbStats.storageSize,
            indexes: dbStats.indexes,
            size: dbStats.indexSize
        },
        sst: {
            cn: serverStatus.connections,
            nw: serverStatus.network,
            op: serverStatus.opcounters,
            up: serverStatus.uptime
        }
    };

    res.setHeader("Cache-Control", "public, max-age=1200");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(data);
}
