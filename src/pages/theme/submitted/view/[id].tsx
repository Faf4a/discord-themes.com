"use client";

import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { getCookie } from "@utils/cookies";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@components/ui/input";
import { Alert } from "@components/ui/alert";
import { toast } from "@hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Theme {
    _id: string;
    title: string;
    description: string;
    file: string;
    fileUrl: string;
    contributors: string[];
    sourceLink: string;
    validatedUsers: {
        id: string;
        username: string;
        avatar: string;
    };
    state: "approved" | "rejected" | "pending";
    themeContent: string;
    submittedAt: Date;
    submittedBy: string;
}

function ThemeList() {
    const { authorizedUser, isAuthenticated, isLoading } = useWebContext();
    const router = useRouter();
    const { id } = router.query;
    const [themes, setTheme] = useState<Theme>();
    const [loading, setLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    const handleAddTag = () => {
        if (newTag && selectedTags.length < 5 && !selectedTags.includes(newTag)) {
            setSelectedTags([...selectedTags, newTag]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    const handleApprove = async () => {
        if (!id) return;

        try {
            const response = await fetch(`/api/submit/approve?id=${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getCookie("_dtoken")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tags: selectedTags })
            });

            if (!response.ok) {
                return toast({
                    title: "Error",
                    description: "Failed to approve theme, backend failed to respond"
                });
            }

            toast({
                title: "Approved",
                description: `Approved the theme '${themes.title}'! You may need to wait a few minutes for the changes to take effect.`
            });

            router.push("/theme/submitted");
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to approve theme with reason: ${err.message}`
            });
        }
    };

    const handleReject = async () => {
        if (!id) return;

        try {
            const response = await fetch(`/api/submit/reject?id=${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getCookie("_dtoken")}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to reject theme");
            }

            router.push("/theme/submitted");

            toast({
                title: "Rejected",
                description: `Rejected the theme '${themes.title}'!`
            });
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to reject theme with reason: ${err.message}`
            });
        }
    };

    const analyzeThemeContent = (content: string): string[] => {
        const tags: string[] = [];
        const decodedContent = Buffer.from(content, "base64").toString();

        if (decodedContent.includes("import") || decodedContent.length > 500) {
            tags.push("theme");
        } else {
            tags.push("snippet");
        }

        return tags;
    };

    const analyzeImage = async (imageUrl: string) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        return new Promise<string[]>((resolve) => {
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                if (!imageData) return resolve([]);

                let brightness = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                    brightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
                }
                brightness = brightness / (imageData.data.length / 4);

                resolve([brightness < 128 ? "dark" : "light"]);
            };
            img.src = imageUrl;
        });
    };

    const handleSuggestedTagClick = (tag: string) => {
        if (!selectedTags.includes(tag) && selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    useEffect(() => {
        if (themes?.file && themes?.themeContent) {
            const analyzeTags = async () => {
                const contentTags = analyzeThemeContent(themes.themeContent);
                const imageTags = await analyzeImage(themes.file);
                setSuggestedTags([...new Set([...contentTags, ...imageTags])]);
            };
            analyzeTags();
        }
    }, [themes]);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !authorizedUser?.admin)) {
            window.location.href = "/";
        }
    }, [isAuthenticated, authorizedUser, isLoading]);

    useEffect(() => {
        if (!id || !isAuthenticated) return;

        const fetchThemes = async () => {
            try {
                const response = await fetch("/api/get/submissions", {
                    headers: {
                        Authorization: `Bearer ${getCookie("_dtoken")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch themes");
                }

                const data = await response.json();
                // Find theme directly in array
                const theme = data.find((theme) => theme._id === id);

                if (!theme) {
                    throw new Error("Theme not found");
                }

                setTheme(theme);
            } catch (err) {
                console.error(err);
                window.location.href = "/theme/submitted";
            } finally {
                setLoading(false);
            }
        };

        fetchThemes();
    }, [isAuthenticated, authorizedUser, isLoading, id]);

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <Card className="w-full">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-bold">{themes?.title}</CardTitle>
                                    <CardDescription className="mt-2">
                                        {" "}
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{themes?.description}</ReactMarkdown>
                                    </CardDescription>
                                </div>
                                {themes?.state === "approved" ? (
                                    <Badge variant="outline" className="ml-2 bg-green-400/70 border-green-400 text-white">
                                        Approved
                                    </Badge>
                                ) : themes?.state === "rejected" ? (
                                    <Badge variant="outline" className="ml-2 bg-red-400/70 border-red-400 text-white">
                                        Rejected
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="ml-2 bg-yellow-400/70 border-yellow-400 text-white">
                                        Pending Review
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-gray-600 dark:text-gray-300">{themes?.description}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Contributors</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.values(themes.validatedUsers).map((user: any) => (
                                                <div key={user.id} className="flex items-center gap-2">
                                                    <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt={user.username} className="w-6 h-6 rounded-full" draggable={false} />
                                                    {user.username} ({user.id})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Submission Details</h3>
                                        <p className="text-sm text-gray-500">
                                            Submitted {themes?.submittedAt && formatDistanceToNow(new Date(themes.submittedAt))} ago by{" "}
                                            {Object.values(themes.validatedUsers)
                                                .map((user: any) => user.username)
                                                .join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Theme Content</h3>
                                        <p className="text-xs text-muted-foreground mb-2">Taken via GitHub API, if invalid reject</p>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-[200px] overflow-auto">
                                            <pre className="text-sm">
                                                <code>{Buffer.from(themes?.themeContent, "base64").toString()}</code>
                                            </pre>
                                        </div>
                                        <a href={themes.sourceLink} className="text-xs text-muted-foreground mb-2">
                                            {themes.sourceLink}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    {themes?.file && (
                                        <>
                                            <h3 className="font-semibold mb-2">Theme Preview</h3>
                                            <img src={themes.file} alt={themes.title} className="rounded-lg" />
                                        </>
                                    )}
                                </div>
                            </div>
                            {themes.state !== "pending" ? (
                                <Alert variant={themes.state === "approved" ? "default" : "destructive"} className="text-sm">
                                    This theme has already been {themes.state === "approved" ? "approved" : "rejected"} and cannot be modified.
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-card rounded-lg border border-muted">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            Selected Tags
                                            <span className="text-xs text-muted-foreground font-normal">({selectedTags.length}/5)</span>
                                        </h3>
                                        {suggestedTags.length > 0 && (
                                            <div className="mb-6 p-4 bg-card rounded-lg border border-blue-700">
                                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                    Suggested Tags
                                                    <span className="text-xs text-muted-foreground font-normal">(click to add)</span>
                                                    <span className="text-xs text-muted-foreground font-normal">based on theme content and image</span>
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedTags.map((tag) => (
                                                        <Badge key={tag} variant="suggested" className="transition-all" onClick={() => handleSuggestedTagClick(tag)}>
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedTags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="px-3 py-1 pr-2">
                                                    {tag}
                                                    <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-destructive">
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                            {selectedTags.length === 0 && <span className="text-sm text-muted-foreground">No tags selected</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a custom tag" disabled={selectedTags.length >= 5} onKeyPress={(e) => e.key === "Enter" && handleAddTag()} className="flex-1" />
                                            <Button variant="outline" onClick={handleAddTag} disabled={selectedTags.length >= 5 || !newTag}>
                                                Add Tag
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => window.open(themes?.sourceLink, "_blank")}>
                                    Source <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                            <div className="flex gap-4">
                                <Button disabled={themes.state !== "pending"} variant="destructive" onClick={handleReject}>
                                    Reject <X className="w-4 h-4 ml-2" />
                                </Button>
                                <Button disabled={themes.state !== "pending"} variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                    Approve <Check className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ThemeList;
