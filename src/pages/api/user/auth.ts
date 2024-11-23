import type { NextApiRequest, NextApiResponse } from "next";
import type { APIConnection as Connection, APIUser as User} from "discord-api-types/v10";
import clientPromise from "@utils/db";
import { createHash, randomBytes } from "crypto";

interface UserEntry {
    user: {
        id: string;
        avatar: string;
        global_name: string;
        preferredColor: string;
        key: string;
        keyVersion?: number;
        githubAccount?: string;
    };
    createdAt: Date;
}

declare module "discord-api-types/v10" {
    // eslint-disable-next-line no-unused-vars
    interface APIUser {
        banner_color?: string | null;
    }
}

async function fetchGitHubAccount(token: string): Promise<string | null> {
    const response = await fetch("https://discord.com/api/users/@me/connections", {
        headers: {
            Authorization: `${token}`
        }
    });

    if (!response.ok) {
        return null;
    }

    const connections: Connection[] = await response.json();
    const githubConnection = connections.find(connection => connection.type === "github");
    return githubConnection ? githubConnection.name : null;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const { code, callback, error, error_description } = req.query;

    if (error && error_description) {
        console.error("Auth Failed!", error, error_description);
        res.redirect("/");
    }

    if (!code) {
        return res.status(400).json({ message: "Cannot authorize without token, check if the token is missing" });
    }

    // turn access code into something useful
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: process.env.AUTH_DISCORD_ID,
            client_secret: process.env.AUTH_DISCORD_SECRET,
            code: code as string,
            grant_type: "authorization_code",
            redirect_uri: process.env.NODE_ENV === "production" ? "https://discord-themes.com/api/user/auth?callback=/auth/callback" : "http://localhost:4321/api/user/auth?callback=/auth/callback",
            scope: "identify,connections"
        }).toString()
    });

    const oauthResponse = await tokenResponse.json();

    // get le discord account info
    const response = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `${oauthResponse.token_type} ${oauthResponse.access_token}`
        }
    });

    console.log(response);

    if (!response.ok) {
        return res.status(401).json({ status: 401, message: "Invalid or expired Discord token" });
    }

    const user: User = await response.json();

    const githubAccount = await fetchGitHubAccount(`${oauthResponse.token_type} ${oauthResponse.access_token}`);

    const client = await clientPromise;
    const db = client.db("themesDatabase");
    const users = db.collection("users");

    const generateKey = () => {
        const randomData = randomBytes(32);
        const salt = randomBytes(16);
        const timestamp = new Date().getTime().toString();
        
        return createHash('sha256')
            .update(Buffer.concat([randomData, salt]))
            .update(timestamp)
            .digest('hex');
    };
    
    const userEntry = (await users.findOne({ "user.id": user.id }))?.user;
    let authKey: string;
    
    if (!userEntry) {
        const uniqueKey = generateKey();
        await users.insertOne({
            user: {
                id: user.id,
                avatar: user.avatar,
                global_name: user.global_name,
                preferredColor: user.banner_color,
                key: uniqueKey,
                keyVersion: 2,
                githubAccount: githubAccount || undefined
            },
            createdAt: new Date()
        });
        authKey = uniqueKey;
    } else {
        if (!userEntry.keyVersion || userEntry.keyVersion < 2) {
            const newKey = generateKey();
            await users.updateOne(
                { "user.id": user.id },
                { 
                    $set: {
                        "user.key": newKey,
                        "user.keyVersion": 2
                    }
                }
            );
            authKey = newKey;
        } else {
            authKey = userEntry.key;
        }
    
        const updates: Partial<UserEntry['user']> = {};
    
        if (userEntry.avatar !== user.avatar) {
            updates["avatar"] = user.avatar;
        }
        if (userEntry.preferredColor !== user.banner_color) {
            updates["preferredColor"] = user.banner_color;
        }
        if (userEntry.global_name !== user.global_name) {
            updates["global_name"] = user.global_name;
        }
        if (githubAccount && userEntry.githubAccount !== githubAccount) {
            updates["githubAccount"] = githubAccount;
        }
    
        if (Object.keys(updates).length > 0) {
            await users.updateOne(
                { "user.id": user.id }, 
                { $set: Object.entries(updates).reduce((acc, [key, value]) => ({
                    ...acc,
                    [`user.${key}`]: value
                }), {}) }
            );
        }
    }

    res.setHeader("Content-Type", "application/json");

    if (!authKey) {
        res.status(500).json({ status: 500, message: "Failed to generate a user token, if you think that this is a bug feel free to open an issue at https://github.com/faf4a/themesApi" });
    } else {
        if (callback) res.redirect((callback as string) + `?token=${authKey}`);
        else res.status(200).json({ status: 200, token: authKey, user: { id: user.id, avatar: user.avatar, preferredColor: user.banner_color, githubAccount } });
    }
}