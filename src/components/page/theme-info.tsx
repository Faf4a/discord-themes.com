import { Button } from "@components/ui/button";
import { Calendar, Check, Code, Download, ExternalLink, Eye, Github, Heart, Book } from "lucide-react";
import { useEffect, useState } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useWebContext } from "@context/auth";
import { Card, CardContent } from "@components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { AccountBar } from "@components/account-bar";
import { useToast } from "@hooks/use-toast";
import { getCookie } from "@utils/cookies";

const Skeleton = ({ className = "", ...props }) => <div className={`animate-pulse bg-muted/30 rounded ${className}`} {...props} />;

export default function Component({ id }: { id?: string }) {
    const [theme, setTheme] = useState(null);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedThemes, setLikedThemes] = useState();
    const [isLikeDisabled, setIsLikeDisabled] = useState(false);
    const { authorizedUser, isAuthenticated, isLoading, themes, error } = useWebContext();
    const { toast } = useToast();

    const previewUrl = `/api/preview?url=/api/${id}`;

    useEffect(() => {
        if (!id || isLoading || error) return;

        const theme = themes.find((x) => x.id == id);

        if (!theme) {
            window.location.href = "/";
        } else {
            setTheme(theme);
            setLoading(false);
        }
    }, [themes, error, id, isLoading]);

    useEffect(() => {
        if (isAuthenticated) {
            getLikedThemes();
        }
    }, [isAuthenticated]);

    if (!id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="w-32 h-8" />
            </div>
        );
    }

    const handleAuthorClick = (author) => {
        window.open("/users/" + author.discord_snowflake);
    };

    const renderAuthor = (author) => {
        if (isLoading) {
            return (
                <div key={author.discord_snowflake} className="p-2 rounded-lg border bg-background border-input">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </div>
            );
        }

        return (
            <div key={author.discord_snowflake} className="p-3 rounded-lg border bg-background border-input hover:border-primary/40 transition-colors">
                <p className="font-semibold">{author.discord_name}</p>
                <p className="text-xs text-muted-foreground">ID: {author.discord_snowflake}</p>
                <div className={`grid ${author.github_name ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-2`}>
                    <Button variant="outline" onClick={() => handleAuthorClick(author)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Profile
                    </Button>
                    {author.github_name && (
                        <Button variant="outline" onClick={() => window.open(`https://github.com/${author.github_name}`, "_blank")}>
                            <Github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const handleDownload = async () => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/api/download/${theme.id}`);
        xhr.responseType = "blob";

        xhr.onload = () => {
            if (xhr.status === 200) {
                const url = window.URL.createObjectURL(xhr.response);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${theme.name}.theme.css`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setIsDownloaded(true);
                setTimeout(() => {
                    setIsDownloaded(false);
                }, 5000);
            }
        };

        xhr.send();
    };

    const handleLike = (themeId) => async () => {
        if (!isAuthenticated || isLikeDisabled) return;
        if (!themeId || !likedThemes) return;

        setIsLikeDisabled(true);

        const token = getCookie("_dtoken");
        let response: Response;
        // @ts-ignore
        const isCurrentlyLiked = likedThemes?.likes?.find((t) => t.themeId === themeId)?.hasLiked;

        setLikedThemes((prev) => ({
            // @ts-ignore
            ...prev,
            likes: (prev as any)!.likes.map((like) => (like.themeId === themeId ? { ...like, hasLiked: !isCurrentlyLiked } : like))
        }));

        try {
            if (isCurrentlyLiked) {
                response = await fetch("/api/likes/remove", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ themeId })
                });
            } else {
                response = await fetch("/api/likes/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ themeId })
                });
            }

            if (!response.ok) {
                setLikedThemes((prev) => ({
                    // @ts-ignore
                    ...prev,
                    likes: (prev as any)!.likes.map((like) => (like.themeId === themeId ? { ...like, hasLiked: isCurrentlyLiked } : like))
                }));

                toast({
                    description: "Failed to like theme, try again later."
                });
            }
        } catch (error) {
            setLikedThemes((prev) => ({
                // @ts-ignore
                ...prev,
                likes: (prev as any)!.likes.map((like) => (like.themeId === themeId ? { ...like, hasLiked: isCurrentlyLiked } : like))
            }));

            toast({
                description: "Failed to like theme, try again later."
            });
        }

        setTimeout(() => {
            setIsLikeDisabled(false);
        }, 1500);
    };

    async function getLikedThemes() {
        const token = getCookie("_dtoken");

        const response = await fetch("/api/likes/get", {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        }).then((res) => res.json());

        setLikedThemes(response);
    }

    const statsItems = [
        {
            icon: Download,
            label: "Downloads",
            value: theme?.downloads || 0
        },
        {
            icon: Heart,
            label: "Likes",
            value: theme?.likes || 0
        },
        {
            icon: Calendar,
            label: "Created",
            value: theme?.release_date ? new Date(theme.release_date).toLocaleDateString() : "Recently"
        },
        {
            icon: Book,
            label: "Version",
            value: theme?.version || "1.0.0"
        }
    ];

    const ThemeStats = () => (
        <div className="grid grid-cols-2 gap-4 mt-6 select-none">
            {statsItems.map(({ icon: Icon, label, value }) => (
                <Card key={label} className="p-4">
                    <CardContent className="p-0 flex flex-col items-center">
                        <Icon className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <>
            {!loading && (
                <Head>
                    <title>{theme.name} - Discord Theme</title>
                    <meta name="description" content={theme.description} />
                    <meta name="keywords" content="discord, theme, custom, discord themes" />
                    <meta name="author" content="discord-themes.com" />

                    <meta property="og:type" content="website" />
                    <meta property="og:title" content={theme.name} />
                    <meta property="og:description" content={theme.description} />
                    <meta property="og:image" content={theme.thumbnail_url} />
                    <meta property="og:url" content="https://discord-themes.com" />
                    <meta property="og:site_name" content={`@${theme.author.discord_name} - https://discord-themes.com`} />

                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={theme.name} />
                    <meta name="twitter:description" content={theme.description} />
                    <meta name="twitter:image" content={theme.thumbnail_url} />
                    <meta name="twitter:site" content="discord-themes.com" />
                </Head>
            )}
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">
                                <a href="/" className="hover:opacity-80 transition-opacity">
                                    Theme Library
                                </a>
                            </h1>
                            <AccountBar className="ml-auto" />
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
                        <div className="space-y-6">
                            {loading ? (
                                <>
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-64 w-full" />
                                </>
                            ) : (
                                <div>
                                    <div className="rounded-lg border-b border-border/40 bg-card p-6 mb-2">
                                        <h2 className="text-2xl font-bold mb-4">{theme.name}</h2>
                                        <p className="description text-muted-foreground">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{theme.description}</ReactMarkdown>
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-b border-border/40 bg-card p-6">
                                        {theme?.longDescription && (
                                            <p className="description text-muted-foreground mb-4">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{theme.longDescription}</ReactMarkdown>
                                            </p>
                                        )}
                                        <div className="bg-muted rounded-lg flex justify-center items-center">
                                            <Image draggable={false} src={theme.thumbnail_url} alt={theme.name} width={1920} height={1080} className="rounded-lg object-contain" priority />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-lg border-b border-border/40 bg-card p-4">
                                <div className="space-y-3">
                                    <Button size="sm" disabled={loading || isDownloaded} onClick={handleDownload} className="w-full flex items-center gap-2 justify-center">
                                        {isDownloaded ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Downloaded
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                Download
                                            </>
                                        )}
                                    </Button>
                                    <Button disabled={loading || window.innerWidth <= 768} variant="outline" className="w-full" size="lg" onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {window.innerWidth <= 768 ? "Not available on mobile" : "Preview"}
                                    </Button>
                                    {!loading &&
                                        (isAuthenticated ? (
                                            <Button
                                                variant="outline"
                                                disabled={!isAuthenticated || isLoading || isLikeDisabled}
                                                className={`w-full ${
                                                    // @ts-ignore
                                                    likedThemes?.likes?.find((t) => t.themeId === theme.id)?.hasLiked ? "text-primary border-primary hover:bg-primary/10" : ""
                                                }`}
                                                onClick={handleLike(theme.id)}
                                            >
                                                {
                                                    // @ts-ignore
                                                    likedThemes?.likes?.find((t) => t.themeId === theme.id)?.hasLiked ? <Heart className="fill-current mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />
                                                }
                                                {
                                                    // @ts-ignore
                                                    likedThemes?.likes?.find((t) => t.themeId === theme.id)?.hasLiked ? "Liked" : "Like"
                                                }
                                            </Button>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="w-full">
                                                        <Button variant="outline" disabled={!isAuthenticated} className="w-full">
                                                            <Heart className="mr-2 h-4 w-4" /> Like
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>You must be logged in to like themes.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    {!loading && isAuthenticated && (authorizedUser?.id === theme?.author?.discord_snowflake || authorizedUser?.is_admin) && (
                                        <>
                                            <h2>Author Options</h2>
                                            <Button variant="outline" className="w-full" onClick={() => window.open(`/theme/edit/${theme.id}`, "_blank")} disabled>
                                                <Code className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors" onClick={() => window.open(`/theme/delete/${theme.id}`, "_blank")} disabled>
                                                <Code className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {!loading && <ThemeStats />}
                            </div>
                            {!loading && (
                                <div className="rounded-lg border-b border-border/40 bg-card p-4">
                                    <div className="space-y-3">
                                        <h2 className="text-lg font-semibold">Contributors</h2>
                                        <div className="grid gap-2">{Array.isArray(theme.author) ? theme.author.map(renderAuthor) : renderAuthor(theme.author)}</div>
                                    </div>
                                </div>
                            )}
                            {!loading && theme.guild && (
                                <div className="rounded-lg border-b border-border/40 bg-card p-4">
                                    <div className="space-y-3">
                                        <h2>Support Server</h2>
                                        <Button variant="outline" onClick={() => window.open(theme.guild, "_blank")} className="w-full">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Join {theme.guild.name}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
