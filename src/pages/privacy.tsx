import React from "react";
import { Card, CardContent } from "@components/ui/card";
import { Check } from "lucide-react";
import Head from "next/head";

export default function PrivacyPolicy() {
    const lastUpdated = new Date("2024-11-08T18:24:10.692Z");

    return (
        <>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta name="keywords" content="discord themes privacy policy, theme library privacy, data protection, user privacy, discord customization privacy" />
                <meta name="theme-color" content="#5865F2" />
                <meta name="application-name" content="Theme Library" />
                <meta name="description" content="Learn about Theme Library's privacy policy, data collection practices, and how we protect your information when using our Discord theme platform." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://discord-themes.com/" />
                <meta property="og:title" content="Privacy Policy | Theme Library" />
                <meta property="og:description" content="Read our privacy policy to understand how Theme Library handles your data and protects your privacy when using our Discord theme platform." />
                <title>Privacy Policy | Theme Library</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8 description">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mb-8">Last updated: {lastUpdated.toLocaleDateString()}</p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                                <p className="text-muted-foreground">This Privacy Policy explains how Theme Library ("we," "us," or "our") collects, uses, and protects your information when you use our service.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4">Data Collection</h2>
                                <p className="text-muted-foreground mb-4">We collect limited information through Discord's OAuth authentication process. We do not sell your personal data to any third parties.</p>

                                <Card className="p-6 mb-6">
                                    <CardContent className="p-0 space-y-4">
                                        <h3 className="text-3xl font-medium">Collected Data</h3>
                                        <p className="text-muted-foreground">By authorizing with Discord you grant us the right to store the following associated data:</p>
                                        <div className="grid gap-2 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                <span>Discord User ID</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                <span>Username</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                <span>Avatar</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                <span>Preferred Color</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                <span>GitHub connection status (if available)</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <p className="text-muted-foreground mt-4">
                                    You can read more about those shared data in the official Discord Developer Documentation,{" "}
                                    <a href="https://discord.com/developers/docs/topics/oauth2" className="text-primary-foreground">
                                        here
                                    </a>
                                    .
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4">Data Usage</h2>
                                <p className="text-muted-foreground mb-4">The collected information is used solely for:</p>
                                <ul className="list-disc pl-6 text-muted-foreground">
                                    <li>Providing and maintaining our service</li>
                                    <li>User authentication</li>
                                    <li>Displaying your profile information within the platform</li>
                                    <li>Managing theme submissions and credits</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4">Data Protection</h2>
                                <p className="text-muted-foreground">We implement appropriate security measures to protect your personal information. Your data is stored securely and is only accessible to authorized personnel.</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
                                <p className="text-muted-foreground">
                                    You have the right to request access to, correction of, or deletion of your personal information. To exercise these rights, please head to the Settings page accessible via the Account Settings on the top right. If you do not have access to your account but can prove ownership we can assist you in the process by contacting us via E-Mail,{" "}
                                    <a href="mailto:privacy@discord-themes.com" className="text-primary-foreground">
                                        privacy@discord-themescom
                                    </a>
                                    .
                                </p>
                            </section>
                        </div>
                        <hr />
                        <div className="container mt-4">
                            <Card className="p-6 mb-6">
                                <CardContent className="p-0 space-y-4">
                                    <p className="text-muted-foreground">Previous Privacy Policies will show up here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
