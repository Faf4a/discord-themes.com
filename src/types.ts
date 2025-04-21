import { APIUser as User } from "discord-api-types/v10";

export interface UserData {
    id: User["id"];
    avatar?: User["avatar"];
    global_name?: User["global_name"];
    username: User["username"];
    preferredColor?: User["accent_color"];
    admin?: boolean;
}

export interface Author {
    github_name?: string;
    discord_name: User["username"];
    discord_snowflake: User["id"];
}

export interface Theme {
    last_updated: string;
    id: string;
    name: string;
    file_name: string;
    content: string;
    type: string | "theme" | "snippet";
    description: string;
    external_url?: string;
    download_url: string;
    version?: string;
    author: Author | Author[];
    likes?: number;
    downloads?: number;
    tags: string[];
    thumbnail_url: string;
    release_date: string;
    guild?: {
        name: string;
        snowflake: string;
        invite_link: string;
    };
    source?: string;
}
