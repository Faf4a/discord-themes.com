const env = process.env.NODE_ENV;

export const DEV_SERVER = "https://literate-engine-rv7579wprjq2px77-4321.app.github.dev";
export const PRODUCION_SERVER = "https://discord-themes.com";
export const SERVER = env === "development" ? DEV_SERVER : PRODUCION_SERVER;
export const RAW_SERVER = env === "development" ? "literate-engine-rv7579wprjq2px77-4321.app.github.dev" : "discord-themes.com";