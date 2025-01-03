import React from "react";
import App from "@components/page/theme";
import Head from "next/head";

export default function Page() {
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
                <meta property="og:description" content="Find your favourite themes all at one place." />
                <title>Theme Library</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <App />
        </div>
    );
}
