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
            }
        ];
    },
    images: {
        domains: ["localhost:3500", "cdn.discordapp.com", "cdn.discord-themes.com"],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "3000",
                pathname: "*"
            },
            {
                protocol: "https",
                hostname: "themes-delta.vercel.app",
                port: "",
                pathname: "*"
            },
            {
                protocol: "https",
                hostname: "themes.faf4a.xyz",
                port: "",
                pathname: "*"
            }
        ]
    }
};
