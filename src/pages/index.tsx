import React from "react";
import App from "@components/page/theme";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { type Theme } from "@types";

export const getStaticProps = (async () => {
    const res = await fetch("https://raw.githubusercontent.com/Faf4a/stunning-spoon/refs/heads/main/themes.json");
    const themes = await res.json();
    return { props: { themes }, revalidate: 60 };
}) satisfies GetStaticProps<{
    themes: Theme[];
}>;

export default function ThemePage({ themes }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <div>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta name="keywords" content="discord, theme, custom, discord themes, betterdiscord, vencord" />
                <meta name="theme-color" content="#5865F2" />
                <meta name="application-name" content="Theme Library" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://discord-themes.com/" />
                <meta property="og:title" content="ThemeLibrary" />
                <meta property="og:description" content="Find your favourite themes for Vencord or BetterDiscord all at one place." />
                <title>Theme Library</title>
                <meta name="description" content="Find your favourite themes for Vencord or BetterDiscord all at one place." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <App themes={themes} />
        </div>
    );
}
