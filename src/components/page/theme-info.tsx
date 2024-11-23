import { Button } from "@components/ui/button";
import { ArrowLeft, Calendar, Check, Code, Download, ExternalLink, Eye, Github, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useAuth } from "@context/auth";

const Skeleton = ({ className = "", ...props }) => <div className={`animate-pulse bg-muted/30 rounded ${className}`} {...props} />;

export default function Component({ id }: { id?: string }) {
    const [theme, setTheme] = useState(null);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedThemes, setLikedThemes] = useState();
    const { authorizedUser, isAuthenticated, isLoading, themes, error } = useAuth();

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
                <div key={author.discord_snowflake} className="p-2 rounded-md border bg-background border-input">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                </div>
            );
        }

        return (
            <div key={author.discord_snowflake} className="p-2 rounded-md border bg-background border-input flex justify-between items-center">
                <div>
                    <p>{author.discord_name}</p>
                    <p className="text-xs text-muted-foreground">{author.discord_snowflake}</p>
                    {author.github_name && (
                        <div className="flex items-center mt-2 hover:text-gray-500 cursor-pointer transition-colors duration-200">
                            <span className="rounded-full bg-input p-1 mr-2">
                                <Github width={12} height={12} />
                            </span>
                            <a target="_blank" href={`https://github.com/${author.github_name}`}>
                                {author.github_name}
                            </a>
                        </div>
                    )}
                </div>
                <Button variant="outline" onClick={() => handleAuthorClick(author)} className="ml-2 p-1">
                    <ExternalLink className="h-4 w-6" />
                </Button>
            </div>
        );
    };

    const handleDownload = async () => {
        setIsDownloaded(true);

        // /api/download/:id
        window.location.href = `/api/download/${theme.id}`;

        setTimeout(() => {
            setIsDownloaded(false);
        }, 5000);
    };

    const handleLike = (themeId) => async () => {
        if (!isAuthenticated) {
            return;
        }

        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        const response = await fetch("/api/likes/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ themeId })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 200) {
                setTheme((prev) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
            }
        }
    };

    async function getLikedThemes() {
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        const response = await fetch("/api/likes/get", {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        }).then((res) => res.json());

        setLikedThemes(response);
    }

    return (
        <>
            {!loading && (
                <Head>
                    <title>{theme.name} - Discord Theme</title>
                    <meta name="description" content={theme.description} />
                    <meta name="keywords" content="discord, theme, custom, discord themes" />
                    <meta name="author" content="discord-themes.com" />

                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content={theme.name} />
                    <meta property="og:description" content={theme.description} />
                    <meta property="og:image" content={theme.thumbnail_url} />
                    <meta property="og:url" content="https://discord-themes.com" />
                    <meta property="og:site_name" content="Discord Themes" />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={theme.name} />
                    <meta name="twitter:description" content={theme.description} />
                    <meta name="twitter:image" content={theme.thumbnail_url} />
                    <meta name="twitter:site" content="@discordthemes" />
                </Head>
            )}
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-999 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">
                                <a href="/">Theme Library</a>
                            </h1>
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
                                            <Image src={theme.thumbnail_url} alt={theme.name} width={1920} height={1080} className="rounded-lg object-contain" priority />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-lg border-b border-border/40 bg-card p-4">
                                <div className="space-y-3">
                                    <Button disabled={loading || isDownloaded} onClick={handleDownload} className="w-full" size="lg">
                                        {isDownloaded ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Downloaded
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </>
                                        )}
                                    </Button>
                                    <Button disabled={loading || window.innerWidth <= 768} variant="outline" className="w-full" size="lg" onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        {window.innerWidth <= 768 ? "Not available on mobile" : "Preview"}
                                    </Button>
                                    {!loading && isAuthenticated && (
                                        <Button
                                            variant="outline"
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
                                    )}
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
                                {!loading && (
                                    <div className="mt-4 p-4 text-sm text-muted-foreground">
                                        <p className="flex items-center mb-2">
                                            <Code className="mr-2 h-4 w-4" /> Version: <span className="text-primary ml-1">{theme?.version || "1.0.0"}</span>
                                        </p>
                                        <p className="flex items-center mb-2">
                                            <Calendar className="mr-2 h-4 w-4" /> Released: <span className="text-primary ml-1">{theme?.release_date ? new Date(theme.release_date).toLocaleDateString() : "Recently"}</span>
                                        </p>
                                        <p className="flex items-center mb-2">
                                            <Heart className="mr-2 h-4 w-4" /> Likes: <span className="text-primary ml-1">{theme?.likes || "0"}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <Download className="mr-2 h-4 w-4" /> Downloads: <span className="text-primary ml-1">{theme?.downloads ?? 0}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!loading && (
                                <div className="rounded-lg border-b border-border/40 bg-card p-4">
                                    <div className="space-y-3">
                                        <h2>Contributors</h2>
                                        {Array.isArray(theme.author) ? theme.author.map(renderAuthor) : renderAuthor(theme.author)}
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
