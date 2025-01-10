import { ExternalLink, Heart, Star } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import Head from "next/head";

export default function VencordPluginPage() {
    const prerequisites = [
        { id: 1, name: "Git", url: "https://git-scm.com/downloads" },
        { id: 2, name: "Node.js", url: "https://nodejs.org/" },
        { id: 3, name: "pnpm", url: "https://pnpm.io/installation" }
    ];

    const installSteps = [
        {
            id: 1,
            title: "Clone Vencord",
            command: "git clone https://github.com/Vendicated/Vencord"
        },
        {
            id: 2,
            title: "Install Dependencies",
            command: "cd Vencord\npnpm install --frozen-lockfile"
        },
        {
            id: 3,
            title: "Create Plugins Directory",
            platformCommands: {
                linux: "mkdir -p src/userplugins",
                windows: "mkdir src\\userplugins",
                macos: "mkdir -p src/userplugins"
            }
        },
        {
            id: 4,
            title: "Install Theme Library",
            command: "cd src/userplugins\ngit clone https://github.com/faf4a/themelibrary.git"
        },
        {
            id: 5,
            title: "Build and Install",
            command: "cd ..\npnpm build\npnpm inject"
        }
    ];

    return (
        <>
            <Head>
                <title>Theme Library Installation - Discord Themes</title>
                <meta name="description" content="Install the Theme Library plugin for Vencord to customize your Discord experience" />
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">Theme Library Installation</h1>
                        <p className="text-lg text-muted-foreground">A plugin for Vencord to customize your Discord experience</p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => window.open("https://vencord.dev", "_blank")}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Vencord Website
                            </Button>
                            <Button variant="outline" onClick={() => window.open("https://github.com/sponsors/Vendicated", "_blank")} className="group">
                                <Heart className="mr-2 h-4 w-4 transition-colors group-hover:text-pink-500" />
                                Support Vencord
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => window.open("https://github.com/faf4a/themelibrary", "_blank")} className="group">
                            <Star className="mr-2 h-4 w-4 transition-colors group-hover:text-yellow-400" />
                            Star ThemeLibrary on GitHub
                        </Button>{" "}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Prerequisites</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {prerequisites.map(({ id, name, url }) => (
                                    <li key={id}>
                                        <Button variant="link" onClick={() => window.open(url, "_blank")}>
                                            {name} <ExternalLink className="h-4 w-4 ml-1" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Installation Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {installSteps.map(({ id, title, command, platformCommands }) => (
                                <div key={id} className="space-y-2">
                                    <h3 className="text-lg font-semibold">
                                        {id}. {title}
                                    </h3>
                                    <div className="relative">
                                        {platformCommands ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Linux/macOS:</p>
                                                    <code className="block bg-secondary p-3 rounded font-mono text-sm">{platformCommands.linux}</code>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Windows:</p>
                                                    <code className="block bg-secondary p-3 rounded font-mono text-sm">{platformCommands.windows}</code>
                                                </div>
                                            </div>
                                        ) : (
                                            <code className="block bg-secondary p-3 rounded font-mono text-sm">
                                                {command.split("\n").map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                            </code>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
