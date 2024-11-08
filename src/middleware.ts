import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map<string, { count: number; lastRequest: number; hits: number }>();
const RATE_LIMIT_WINDOW = 4000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const HIGHER_RATE_LIMIT_WINDOW = 25000;
const HIGHER_RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_THRESHOLD = 3;

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const path = url.pathname;

    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    if (path.startsWith("/api")) {
        const now = Date.now();

        if (!rateLimit.has(ip)) {
            rateLimit.set(ip, { count: 1, lastRequest: now, hits: 0 });
        } else {
            const rateInfo = rateLimit.get(ip)!;
            const window = rateInfo.hits >= RATE_LIMIT_THRESHOLD ? HIGHER_RATE_LIMIT_WINDOW : RATE_LIMIT_WINDOW;
            const maxRequests = rateInfo.hits >= RATE_LIMIT_THRESHOLD ? HIGHER_RATE_LIMIT_MAX_REQUESTS : RATE_LIMIT_MAX_REQUESTS;

            if (now - rateInfo.lastRequest < window) {
                rateInfo.count += 1;
                if (rateInfo.count > maxRequests) {
                    rateInfo.hits += 1;
                    const retryAfter = Math.ceil((window - (now - rateInfo.lastRequest)) / 1000);
                    return new NextResponse(JSON.stringify({ message: "Too many requests" }), {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": retryAfter.toString()
                        }
                    });
                }
            } else {
                rateInfo.count = 1;
                rateInfo.lastRequest = now;
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"]
};
