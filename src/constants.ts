const env = process.env.NODE_ENV;

export const DEV_SERVER = "https://symmetrical-telegram-r4g9p6r6w7hpg6q-4321.app.github.dev";
export const PRODUCION_SERVER = "https://discord-themes.com";
export const SERVER = env === "development" ? DEV_SERVER : PRODUCION_SERVER;