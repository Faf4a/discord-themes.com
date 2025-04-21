import React from "react";
import { AuthProvider } from "@context/auth";
import ThemeProvider from "@components/theme-provider";
import blob from "/public/favicon.ico";
import Image from "next/image";
import "./theme.css";
import { Toaster } from "@components/ui/toaster";
import { AccountBar } from "@components/account-bar";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <Head>
                <meta http-equiv="content-language" content="en" />
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta name="keywords" content="discord, theme, custom, discord themes, betterdiscord, vencord" />
                <meta name="theme-color" content="#5865F2" />
                <meta name="application-name" content="Theme Library" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://discord-themes.com/" />
                <title>Theme Library</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
            </Head>
            <ThemeProvider attribute="class" defaultTheme="dark">
                <div className="min-h-screen flex flex-col">
                    <Toaster />
                    <Analytics />
                    <Image unoptimized id="favicon" src={blob} alt="Blob" width={100} height={100} className="border-sm absolute mx-auto w-[80px] sm:w-[100px] h-auto rounded-lg select-none hidden pointer-events-none" />

                    <main className="flex-1">
                        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="px-4 py-3">
                                <div className="container mx-auto flex items-center justify-between">
                                    <h1 className="text-xl font-bold">
                                        <a href="/" className="hover:opacity-80 transition-opacity">
                                            Theme Library
                                        </a>
                                    </h1>
                                    <AccountBar className="ml-auto" />
                                </div>
                            </div>
                        </header>
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            <Component {...pageProps} />
                        </div>
                        <footer className="bg-background select-none">
                            <div className="container mx-auto px-2 py-8">
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-center text-sm text-muted-foreground">discord-themes(.com) is not affiliated with or endorsed by Discord Inc.</p>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                                        <a href="https://www.cloudflare.com" className="text-muted-foreground no-underline hover:text-foreground transition-colors duration-200 flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                            Protected by Cloudflare
                                        </a>
                                        <div className="h-4 w-px bg-muted-foreground/60 sm:block hidden"></div>
                                        <a href="https://vercel.com" className="text-muted-foreground no-underline hover:text-foreground transition-colors duration-200 flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                                            Hosted on ▲ Vercel
                                        </a>
                                        <div className="h-4 w-px bg-muted-foreground/60 sm:block hidden"></div>
                                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground no-underline hover:text-foreground transition-colors duration-200 flex items-center gap-2">
                                            Privacy Policy
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </main>
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
