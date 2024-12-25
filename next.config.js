/** @type {import("next").NextConfig} */
module.exports = {
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS,PUT,DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
                ]
            },
            {
                source: "/api/download",
                headers: [
                    {
                        key: "cache-control",
                        value: "s-maxage=600, stale-while-revalidate=30"
                    }
                ]
            },
            {
                source: "/api/get",
                headers: [
                    {
                        key: "cache-control",
                        value: "s-maxage=600, stale-while-revalidate=30"
                    }
                ]
            },
            {
                source: "/api/thumbnail/:name*",
                headers: [
                    {
                        key: "cache-control",
                        value: "s-maxage=600, stale-while-revalidate=30"
                    }
                ]
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "cdn.discord-themes.com",
                pathname: "**"
            }
        ]
    },
    experimental: {
        dynamicIO: true
    },
    reactStrictMode: false,
    productionBrowserSourceMaps: false
};
