import { ReactNode, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { ThemeCard } from "@components/theme/card";
import Image from "next/image";
import { SearchX, Book, Heart, Download, Shield, Ban, Flag, ArrowUp } from "lucide-react";
import { type Theme, type Author } from "@types";
import { Button } from "@components/ui/button";
import { AccountBar } from "@components/account-bar";
import { useWebContext } from "@context/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Card, CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@components/ui/alert";
import { Badge } from "@components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@components/ui/alert-dialog";

interface ThemesResponse {
    themes: Theme[];
    user: {
        id: string;
        global_name: string;
        preferredColor: string;
        avatar: string;
        admin?: boolean;
    };
}

const THEMES_PER_PAGE = 4;

export default function User() {
    const router = useRouter();
    const { user } = router.query;

    const [userThemes, setUserThemes] = useState<ThemesResponse>({
        themes: [],
        user: { id: "", admin: false, global_name: "", preferredColor: "", avatar: "" }
    });
    const [invalid, setInvalid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedThemes, setLikedThemes] = useState<Theme[]>([]);
    const [userLikedThemes, setUserLikedThemes] = useState<Theme[]>([]);
    const [displayCount, setDisplayCount] = useState(THEMES_PER_PAGE);
    const [hasMore, setHasMore] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { authorizedUser, isAuthenticated, isLoading, themes } = useWebContext();

    const userToken = useMemo(() => {
        if (typeof document === "undefined") return undefined;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; _dtoken=`);
        return parts.length === 2 ? parts.pop()?.split(";").shift() : undefined;
    }, []);

    const fetchThemes = useCallback(async () => {
        if (!user || loading) return;
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (userToken) {
                headers.Authorization = `Bearer ${userToken}`;
            }

            const response = await fetch(`/api/user/themes`, {
                method: "POST",
                headers,
                body: JSON.stringify({ userId: user })
            });

            const data = await response.json();
            console.log(data);
            if (response.status === 200) {
                setUserThemes(data);
            } else {
                setInvalid(response.status === 404);
            }
        } catch (error) {
            console.error("Error fetching themes:", error);
            setInvalid(true);
        } finally {
            setLoading(false);
        }
    }, [user, userToken, loading]);

    const fetchLikedThemes = useCallback(async () => {
        if (!userToken || !(user === "@me" || user === authorizedUser?.id) || loading || isLoading) return;

        try {
            const response = await fetch("/api/likes/get", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                }
            });
            const data = await response.json();

            const likedThemeIds = data.likes.filter((like: { themeId: number; hasLiked: boolean }) => like.hasLiked).map((like: { themeId: number }) => like.themeId);

            setUserLikedThemes(themes.filter((theme: Theme) => likedThemeIds.includes(theme.id)));
            setLikedThemes(data);
        } catch (error) {
            console.error("Error fetching liked themes:", error);
        }
    }, [userToken, user, authorizedUser, loading, themes]);

    useEffect(() => {
        if (!isAuthenticated && !isLoading && user === "@me") {
            router.push("/auth/login");
        } else {
            fetchLikedThemes();
        }
    }, [isLoading, fetchLikedThemes]);

    useEffect(() => {
        fetchThemes();
        setDisplayCount(THEMES_PER_PAGE);
        setHasMore(true);
        setLoading(false);
    }, [fetchThemes]);

    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(null, args), wait);
        };
    };

    useEffect(() => {
        const handleScroll = debounce(() => {
            const scrolled = window.scrollY;
            setShowScrollTop(scrolled > 300);
        }, 100);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const loadMore = () => {
        const newCount = displayCount + THEMES_PER_PAGE;
        setDisplayCount(newCount);
        setHasMore(newCount < themes.length);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const statsItems = [
        {
            icon: Download,
            label: "Downloads",
            value: userThemes.themes.reduce((acc, theme) => acc + (theme.downloads || 0), 0)
        },
        {
            icon: Heart,
            label: "Likes",
            value: userThemes.themes.reduce((acc, theme) => acc + (theme.likes || 0), 0)
        },
        {
            icon: Book,
            label: "Themes",
            value: userThemes.themes.length
        }
    ];

    const UserStats = () => (
        <div className="grid grid-cols-3 gap-4 mt-6">
            {statsItems.map(({ icon: Icon, label, value }) => (
                <Card key={label} className="p-4">
                    <CardContent className="p-0 flex flex-col items-center select-none">
                        <Icon className="h-5 w-5 text-muted-foreground mb-2" />
                        <p className="text-xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    function getAuthorDiscordName(author: Author | Author[], userId?: string): string {
        if (isLoading) return "Loading...";
        if (!userId) return "Unknown User";
        if (!author) return "Unknown User";
        if (Array.isArray(author)) {
            const matchingAuthor = author.find((a) => a.discord_snowflake === userId);
            return matchingAuthor?.discord_name ?? "Unknown User";
        }
        return author.discord_name;
    }

    const authorName = getAuthorDiscordName(userThemes.themes[0]?.author, userThemes.user.id);

    const UserProfile = () => (
        <div className="relative">
            <div className="w-full h-32 rounded-t-lg" style={{ backgroundColor: userThemes.user?.preferredColor || "" }} />
            <div className="p-6 -mt-16">
                <div className="flex flex-col items-center">
                    <Image draggable={false} priority height={128} width={128} className="w-24 h-24 rounded-full ring-4 ring-background" src={userThemes.user.avatar ? `https://cdn.discordapp.com/avatars/${userThemes.user.id}/${userThemes.user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Number(userThemes.user.id) / Math.pow(2, 22)) % 6}.png`} alt="Avatar" />{" "}
                    <div className="flex items-center gap-2 mt-4">
                        <h1 className="text-2xl font-bold">{userThemes.user.global_name ? userThemes.user.global_name : userThemes.themes.length ? authorName : "Unknown User"}</h1>
                        {userThemes.user.admin && (
                            <Badge className="fill-current select-none">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{userThemes.user.id}</p>
                    {invalid ? (
                        <p className="text-sm text-muted-foreground">User not found or was deleted</p>
                    ) : (
                        <>
                            {!userThemes.user.global_name && <p className="mt-4 text-sm text-muted-foreground text-center">User hasn't migrated yet, some data may be missing {userThemes.user.global_name ? "" : userThemes.themes.length ? "(pulled partial data from theme submissions)" : "(failed)"}</p>}
                            <UserStats />

                            {authorizedUser?.admin && (
                                <div className="w-full mt-6 space-y-4">
                                    {userThemes.user.admin && (
                                        <Alert className="border-yellow-600/20 bg-yellow-500/10">
                                            <AlertTitle className="text-md font-semibold text-yellow-500">You cannot moderate this user</AlertTitle>
                                            <AlertDescription className="text-yellow-500/90 text-sm">This user has administrative privileges and cannot be moderated.</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" disabled className="flex items-center gap-2">
                                            <Flag className="w-4 h-4" />
                                            View Reports
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" disabled={userThemes.user.admin || invalid} className="flex items-center gap-2">
                                                    <Ban className="w-4 h-4" />
                                                    Delete User
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the account and remove the user's data <b>permanently</b> until they sign up again.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="hover:bg-destructive">Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-center -mt-16">
                <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                ))}
            </div>
        </div>
    );

    const ThemesList = ({ themes }: { themes: Theme[] }) => (
        <div className="space-y-4">
            {themes.slice(0, displayCount).map((theme: Theme) => (
                <ThemeCard key={theme.id} theme={theme} likedThemes={likedThemes} disableDownloads={activeTab === "authored"} />
            ))}

            <div className="flex flex-col items-center gap-4 mt-8">
                {hasMore && themes.length > displayCount && (
                    <Button variant="outline" onClick={loadMore} className="w-full max-w-xs">
                        Load More
                    </Button>
                )}
                {!hasMore && themes.length > THEMES_PER_PAGE && <p className="text-sm text-muted-foreground">You've reached the end!</p>}
            </div>

            {showScrollTop && (
                <Button variant="outline" size="icon" className="fixed bottom-8 right-8 rounded-full" onClick={scrollToTop}>
                    <ArrowUp className="h-4 w-4" />
                </Button>
            )}
        </div>
    );

    const Layout = ({ children }: { children: ReactNode }) => (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">
                            <a href="/" className="hover:opacity-80 transition-opacity">
                                Theme Library
                            </a>
                        </h1>
                        {!isLoading && <AccountBar className="ml-auto" />}
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col-reverse md:flex-row gap-8 min-h-[calc(100vh-5rem)] ">{children}</div>
            </main>
        </div>
    );

    const [activeTab, setActiveTab] = useState("authored");

    if (loading) {
        return (
            <Layout>
                <div className="w-full md:w-2/3 p-4">
                    <Skeleton className="w-full" />
                </div>
                <div className="w-full md:w-1/3">
                    <LoadingSkeleton />
                </div>
            </Layout>
        );
    }

    if (invalid) {
        router.push("/");
        return (
            <Layout>
                <div className="w-full md:w-2/3 rounded-xl bg-card">
                    <div className="h-[50vh] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <SearchX className="w-16 h-16 mb-4 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">User not found or was deleted</p>
                            {user === "@me" && isAuthenticated ? (
                                <Button variant="outline" onClick={() => router.push("/users/@me")} className="mt-4">
                                    My Profile
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={() => router.push("/")} className="mt-4">
                                    Head Back
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3">
                    <Card>
                        <UserProfile />
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="w-full md:w-2/3">
                <Card className="p-6">
                    {user === "@me" || user === authorizedUser?.id ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="authored">
                                    <Book className="w-4 h-4 mr-2" />
                                    My Themes
                                </TabsTrigger>
                                <TabsTrigger value="liked">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Liked Themes
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="authored">{userThemes.themes.length > 0 ? <ThemesList themes={userThemes.themes} /> : <EmptyState icon={Book} title="No themes yet" description="You haven't created any themes" />}</TabsContent>
                            <TabsContent value="liked">{userLikedThemes.length > 0 ? <ThemesList themes={userLikedThemes.reverse()} /> : <EmptyState icon={Heart} title="No liked themes" description="You haven't liked any themes yet" />}</TabsContent>
                        </Tabs>
                    ) : (
                        <div>
                            {userThemes.themes.length > 0 ? (
                                <div>
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <p className="text-2xl font-bold mb-1">
                                            Explore {userThemes.themes.length > 1 ? userThemes.themes.length : "one"} {userThemes.themes.length > 1 ? "Themes" : "Theme"}
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">created by {userThemes.user.global_name ? userThemes.user.global_name : userThemes.themes.length ? authorName : "Unknown User"}</p>
                                    </div>
                                    <ThemesList themes={userThemes.themes} />
                                </div>
                            ) : (
                                <EmptyState icon={Book} title="No themes" description="This user hasn't created any themes" />
                            )}
                        </div>
                    )}
                </Card>
            </div>
            <div className="w-full md:w-1/3 h-fit">
                <div className="sticky top-24">
                    <Card>
                        <UserProfile />
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <Icon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);
