import { AlertTriangle, ExternalLink, Heart, Star } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import Head from "next/head";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";

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
            title: "Build and Inject",
            command: "cd ..\npnpm build\npnpm inject"
        }
    ];

    const renderCommandLines = (commandText) => {
        return commandText.split("\n").map((line, i) => (
            <div key={i} className="font-mono whitespace-pre-wrap">
                {line}
            </div>
        ));
    };

    return (
        <>
            <Head>
                <title>Install Theme Library for Vencord</title>
                <meta name="description" content="Guide to install Theme Library plugin for Vencord and customize your Discord interface." />
            </Head>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">Install Theme Library</h1>
                        <p className="text-lg text-muted-foreground">
                            Enhance your Discord experience using the{" "}
                            <a href="https://vencord.dev" target="_blank" rel="noreferrer" className="text-primary underline">
                                Vencord
                            </a>{" "}
                            and Theme Library.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" onClick={() => window.open("https://vencord.dev", "_blank")}>
                                <ExternalLink className="mr-2 h-4 w-4" /> Vencord Website
                            </Button>
                            <Button variant="outline" onClick={() => window.open("https://github.com/sponsors/Vendicated", "_blank")} className="group">
                                <Heart className="mr-2 h-4 w-4 transition-colors group-hover:text-pink-500" /> Support Vencord
                            </Button>
                            <Button variant="outline" onClick={() => window.open("https://github.com/faf4a/themelibrary", "_blank")} className="group">
                                <Star className="mr-2 h-4 w-4 transition-colors group-hover:text-yellow-400" /> Star ThemeLibrary
                            </Button>
                        </div>
                    </div>

                    <Alert className="bg-muted text-muted-foreground border border-border rounded-2xl shadow-sm mb-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-1 h-5 w-5 text-white" />
                            <div>
                                <AlertTitle className="font-semibold text-foreground">No support</AlertTitle>
                                <AlertDescription>You will not receive support for dev installs! Only do this if you ACTUALLY know what you're doing.</AlertDescription>
                            </div>
                        </div>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Prerequisites</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {prerequisites.map(({ id, name, url }) => (
                                    <li key={id}>
                                        <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                            {name} <ExternalLink className="inline h-4 w-4 ml-1" />
                                        </a>
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
                                    <div>
                                        {platformCommands ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Linux/macOS:</p>
                                                    <div className="overflow-x-auto">
                                                        <code className="block bg-secondary text-foreground p-3 rounded-md font-mono text-sm">{renderCommandLines(platformCommands.linux)}</code>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-1">Windows:</p>
                                                    <div className="overflow-x-auto">
                                                        <code className="block bg-secondary text-foreground p-3 rounded-md font-mono text-sm">{renderCommandLines(platformCommands.windows)}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <code className="block bg-secondary text-foreground p-3 rounded-md font-mono text-sm max-w-full">{renderCommandLines(command)}</code>
                                            </div>
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
