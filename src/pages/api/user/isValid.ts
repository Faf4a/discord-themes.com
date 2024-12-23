import { NextResponse } from "next/server";
import PQueue from "p-queue";
import type { NextRequest } from "next/server";

const queue = new PQueue({
    intervalCap: 45,
    interval: 1000,
    carryoverConcurrencyCount: true
});

export const runtime = "edge";

async function validateDiscordUser(userId: string) {
    try {
        const response = await fetch(`https://discord.com/api/v9/users/${userId}`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            id: data.id,
            username: data.username,
            avatar: data.avatar
        };
    } catch (error) {
        console.error("Failed to fetch Discord user:", error);
        return null;
    }
}

export default async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    try {
        const user = await queue.add(() => validateDiscordUser(userId));

        if (!user) {
            return NextResponse.json({ error: "Invalid Discord user" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
