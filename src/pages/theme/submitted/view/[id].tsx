/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { getCookie } from "@utils/cookies";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@components/ui/input";
import { Alert } from "@components/ui/alert";
import { toast } from "@hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@lib/utils";

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
            <div className="container mx-auto px-4 py-12 rounded-lg">
                {isLoading || loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading theme details...</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto rounded-lg">
                        <Card className="shadow-lg border-0 border-muted rounded-lg">
                            <CardHeader className="border-b border-muted backdrop-blur">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-3xl font-bold">{themes?.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span>Submitted {themes?.submittedAt && formatDistanceToNow(new Date(themes.submittedAt))} ago</span>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-sm px-3 py-1",
                                                themes?.state === "approved" && "bg-green-500/10 text-green-600 border-green-500/20",
                                                themes?.state === "rejected" && "bg-red-500/10 text-red-600 border-red-500/20",
                                                themes?.state === "pending" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                            )}
                                        >
                                            {themes?.state === "approved" ? "Approved" : 
                                             themes?.state === "rejected" ? "Rejected" : "Pending Review"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    <div className="lg:col-span-3 space-y-8">
                                        <div className="prose dark:prose-invert max-w-none">
                                            <h3 className="text-xl font-semibold mb-4">Description</h3>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-muted-foreground">
                                                {themes?.description}
                                            </ReactMarkdown>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Theme Preview</h3>
                                            {themes?.fileUrl ? (
                                                <img 
                                                    src={themes.fileUrl} 
                                                    alt={themes.title} 
                                                    className="rounded-lg border border-muted shadow-sm w-full hover:shadow-md transition-shadow"
                                                />
                                            ) : (
                                                <div className="rounded-lg border border-muted bg-muted/30 h-48 flex items-center justify-center">
                                                    <p className="text-muted-foreground">No preview available</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Theme Content</h3>
                                            <div className="rounded-lg border border-muted bg-muted/30 p-4 relative">
                                                <pre className="text-sm overflow-auto max-h-[400px]">
                                                    <code>{Buffer.from(themes?.themeContent || "", "base64").toString()}</code>
                                                </pre>
                                            </div>
                                            <a 
                                                href={themes?.sourceLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View source code
                                            </a>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="sticky top-16">
                                            <div className="rounded-lg border border-muted p-6 space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4">Contributors</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.values(themes?.validatedUsers || {}).map((user: any) => (
                                                            <div key={user.id} className="inline-flex items-center gap-2 bg-muted/30 rounded-full px-3 py-1">
                                                                <img 
                                                                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                                                                    alt={user.username}
                                                                    className="w-6 h-6 rounded-full"
                                                                />
                                                                <span className="text-sm">{user.username}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {themes?.state === "pending" && (
                                                    <>
                                                        <div>
                                                            <h3 className="text-xl font-semibold mb-4">Theme Tags</h3>
                                                            <div className="space-y-4">
                                                                {suggestedTags.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium">Suggested Tags</label>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {suggestedTags.map((tag) => (
                                                                                <Badge 
                                                                                    key={tag}
                                                                                    variant="outline"
                                                                                    className="cursor-pointer hover:bg-primary/10"
                                                                                    onClick={() => handleSuggestedTagClick(tag)}
                                                                                >
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Selected Tags ({selectedTags.length}/5)</label>
                                                                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                                                        {selectedTags.map((tag) => (
                                                                            <Badge key={tag} variant="secondary">
                                                                                {tag}
                                                                                <button 
                                                                                    onClick={() => handleRemoveTag(tag)}
                                                                                    className="ml-2 hover:text-destructive"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </Badge>
                                                                        ))}
                                                                        {selectedTags.length === 0 && (
                                                                            <p className="text-sm text-muted-foreground">No tags selected</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        type="text"
                                                                        value={newTag}
                                                                        onChange={(e) => setNewTag(e.target.value)}
                                                                        placeholder="Add custom tag..."
                                                                        disabled={selectedTags.length >= 5}
                                                                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                                                                    />
                                                                    <Button 
                                                                        variant="outline"
                                                                        onClick={handleAddTag}
                                                                        disabled={selectedTags.length >= 5 || !newTag}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-muted space-y-4">
                                                            <Button 
                                                                variant="default"
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                                onClick={handleApprove}
                                                            >
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Approve Theme
                                                            </Button>
                                                            <Button 
                                                                variant="destructive"
                                                                className="w-full"
                                                                onClick={handleReject}
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Reject Theme
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}

                                                {themes?.state !== "pending" && (
                                                    <Alert variant={themes.state === "approved" ? "default" : "destructive"}>
                                                        <p>This theme has been {themes.state === "approved" ? "approved" : "rejected"} and cannot be modified.</p>
                                                    </Alert>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThemeList;
