const env = process.env.NODE_ENV;

export const DEV_SERVER = "http://127.0.0.1:4321";
export const PRODUCION_SERVER = "https://discord-themes.com";
export const SERVER = env === "development" ? DEV_SERVER : PRODUCION_SERVER;