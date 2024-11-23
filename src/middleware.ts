import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map<string, { count: number; lastRequest: number; hits: number }>();

const RATE_LIMIT_WINDOW = 4000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const HIGHER_RATE_LIMIT_WINDOW = 25000;
const HIGHER_RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_THRESHOLD = 3;

const AUTH_RATE_LIMIT_WINDOW = 2000;
const AUTH_RATE_LIMIT_MAX_REQUESTS = 10;

const SCREENSHOT_RATE_LIMIT_WINDOW = 15000;
const SCREENSHOT_RATE_LIMIT_MAX_REQUESTS = 2;

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const path = url.pathname;
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

    let isAuthenticated = false;
    if (path.startsWith("/api")) {
        const now = Date.now();

        if (req.method === "POST") {
            const body = await req.json();
            if (body.token) {
                isAuthenticated = true;
            }
        }

        if (path === "/api/preview/screenshot") {
            if (!rateLimit.has(ip)) {
                rateLimit.set(ip, { count: 1, lastRequest: now, hits: 0 });
            } else {
                const rateInfo = rateLimit.get(ip)!;

                if (now - rateInfo.lastRequest < SCREENSHOT_RATE_LIMIT_WINDOW) {
                    rateInfo.count += 1;
                    if (rateInfo.count > SCREENSHOT_RATE_LIMIT_MAX_REQUESTS) {
                        const retryAfter = Math.ceil((SCREENSHOT_RATE_LIMIT_WINDOW - (now - rateInfo.lastRequest)) / 1000);
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
        } else {
            if (!rateLimit.has(ip)) {
                rateLimit.set(ip, { count: 1, lastRequest: now, hits: 0 });
            } else {
                const rateInfo = rateLimit.get(ip)!;

                const window = isAuthenticated ? AUTH_RATE_LIMIT_WINDOW : rateInfo.hits >= RATE_LIMIT_THRESHOLD ? HIGHER_RATE_LIMIT_WINDOW : RATE_LIMIT_WINDOW;

                const maxRequests = isAuthenticated ? AUTH_RATE_LIMIT_MAX_REQUESTS : rateInfo.hits >= RATE_LIMIT_THRESHOLD ? HIGHER_RATE_LIMIT_MAX_REQUESTS : RATE_LIMIT_MAX_REQUESTS;

                if (now - rateInfo.lastRequest < window) {
                    rateInfo.count += 1;
                    if (rateInfo.count > maxRequests) {
                        if (!isAuthenticated) {
                            rateInfo.hits += 1;
                        }
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
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"]
};