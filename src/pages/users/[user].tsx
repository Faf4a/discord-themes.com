"use cache";

import { ReactNode, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { ThemeCard } from "@components/theme/card";
import Image from "next/image";
import { SearchX } from "lucide-react";
import { type Theme } from "@types";
import { Button } from "@components/ui/button";
import { AccountBar } from "@components/account-bar";
import { useWebContext } from "@context/auth";

interface ThemesResponse {
    themes: Theme[];
    user: {
        id: string;
        global_name: string;
        preferredColor: string;
        avatar: string;
    };
}

export default function AuthCallback() {
    const router = useRouter();
    const { user } = router.query;

    const [userThemes, setUserThemes] = useState<ThemesResponse>({
        themes: [],
        user: { id: "", global_name: "", preferredColor: "", avatar: "" }
    });
    const [invalid, setInvalid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedThemes, setLikedThemes] = useState<Theme[]>([]);
    const [userLikedThemes, setUserLikedThemes] = useState<Theme[]>([]);
    const [activeTab, setActiveTab] = useState<"authored" | "liked">("authored");
    const { authorizedUser, isAuthenticated, isLoading, themes } = useWebContext();

    const [displayCount, setDisplayCount] = useState(3);
    const observer = useRef<IntersectionObserver | null>(null);

    const userToken = useMemo(() => {
        if (typeof document === "undefined") return undefined;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; _dtoken=`);
        return parts.length === 2 ? parts.pop()?.split(";").shift() : undefined;
    }, []);

    const fetchThemes = useCallback(async () => {
        if (!userToken || !user || !loading) return;

        const response = await fetch(`/api/user/themes`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ userId: user })
        });

        const data = await response.json();
        if (response.status === 200) {
            setUserThemes(data);
        } else {
            setInvalid(response.status === 404);
        }
        setLoading(false);
    }, [user, userToken, loading]);

    const fetchLikedThemes = useCallback(async () => {
        if (!userToken || !(user === "@me" || user === authorizedUser?.id) || loading) return;

        const response = await fetch("/api/likes/get", {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` }
        });
        const data = await response.json();

        const likedThemeIds = data.likes.filter((like: { themeId: number; hasLiked: boolean }) => like.hasLiked).map((like: { themeId: number }) => like.themeId);

        setUserLikedThemes(themes.filter((theme: Theme) => likedThemeIds.includes(theme.id)));
        setLikedThemes(data);
    }, [userToken, user, authorizedUser, loading, themes]);

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            router.push("/auth/login");
        } else {
            fetchThemes();
            fetchLikedThemes();
        }
    }, [fetchThemes, fetchLikedThemes, isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setDisplayCount((prevCount) => prevCount + 3);
            }
        });

        if (observer.current && document.querySelector("#load-more")) {
            observer.current.observe(document.querySelector("#load-more")!);
        }

        return () => observer.current?.disconnect();
    }, [displayCount]);

    const Layout = useMemo(
        () =>
            ({ children }: { children: ReactNode }) => (
                <>
                    <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="container mx-auto px-4 py-3">
                            <div className="flex justify-between items-center">
                                <h1 className="text-xl font-semibold text-foreground flex-shrink-0">
                                    <a href="/">Theme Library</a>
                                </h1>
                                {!(user === "@me" || user == authorizedUser?.id) && !isLoading && <AccountBar className="ml-auto" />}
                            </div>
                        </div>
                    </header>
                    <div className="min-h-screen flex flex-col items-center pt-4 bg-background">
                        <div className="flex flex-col-reverse md:flex-row w-full max-w-6xl gap-4 h-full pt-16 md:pt-0">{children}</div>
                    </div>
                </>
            ),
        [authorizedUser, isLoading, user]
    );

    const UserInfoCard = useMemo(
        () => () => (
            <div className="w-full md:w-1/3 bg-card rounded-lg h-full mt-4 md:mt-0 md:sticky md:top-4">
                <div className="w-full h-24" suppressHydrationWarning style={{ backgroundColor: userThemes.user?.preferredColor }} />
                <div className="p-6 -mt-12 text-card-foreground">
                    <div className="flex flex-col items-center">
                        <Image priority height={128} width={128} className="w-24 h-24 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background" src={userThemes.user.avatar ? `https://cdn.discordapp.com/avatars/${userThemes.user.id}/${userThemes.user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/5.png"} alt="Avatar" />
                        <h1 className="text-xl font-semibold mt-3">{userThemes.user.global_name}</h1>
                        <p className="text-xs text-muted-foreground">{userThemes.user.id}</p>
                        <div className="w-full mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Downloads</span>
                                <span className="font-medium">{userThemes.themes.reduce((acc, theme) => acc + (theme.downloads || 0), 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Likes</span>
                                <span className="font-medium">{userThemes.themes.reduce((acc, theme) => acc + (theme.likes || 0), 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Themes</span>
                                <span className="font-medium">{userThemes.themes.length}</span>
                            </div>
                        </div>
                    </div>
                    {!userThemes.user.global_name && <div className="mt-4 text-center text-sm text-muted-foreground">The user has not migrated yet, therefore some data may be missing.</div>}
                    <Button className="w-full mt-4" size="lg" variant="outline" onClick={() => (window.location.href = "/")}>
                        Head Back
                    </Button>
                </div>
            </div>
        ),
        [userThemes]
    );

    if (loading) {
        return (
            <Layout>
                <div className="w-full md:w-2/3 rounded-lg bg-card h-full overflow-auto">
                    <div className="p-6">
                        <div className="flex flex-col items-center text-card-foreground h-full justify-center"></div>
                    </div>
                </div>
                <UserInfoCard />
            </Layout>
        );
    }

    if (invalid) {
        return (
            <Layout>
                <div className="w-full md:w-2/3 rounded-lg bg-card h-full overflow-auto">
                    <div className="h-full flex items-center justify-center p-6">
                        <div className="flex flex-col items-center">
                            <SearchX className="w-16 h-16 mb-4 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">This user either doesn't exist or was deleted</p>
                        </div>
                    </div>
                </div>
                <UserInfoCard />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="w-full md:w-2/3 rounded-lg bg-card h-full pb-8">
                <div className="p-6">
                    {(user === "@me" || user == authorizedUser?.id) && (
                        <div className="flex justify-center mb-4">
                            <Button variant={activeTab === "authored" ? "default" : "outline"} onClick={() => setActiveTab("authored")}>
                                Authored Themes
                            </Button>
                            <Button variant={activeTab === "liked" ? "default" : "outline"} onClick={() => setActiveTab("liked")} className="ml-2">
                                Liked Themes
                            </Button>
                        </div>
                    )}
                    {activeTab === "authored" ? (
                        userThemes.themes.length > 0 ? (
                            <>
                                <div className="mb-4">
                                    {userThemes.themes.slice(0, displayCount).map((theme) => (
                                        <ThemeCard disableDownloads key={theme.id} theme={theme} likedThemes={likedThemes} />
                                    ))}
                                </div>
                                {displayCount < userThemes.themes.length && <div id="load-more" className="h-10 w-full bg-transparent" />}
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <p className="text-md mt-4">No themes found</p>
                            </div>
                        )
                    ) : userLikedThemes.length > 0 ? (
                        <>
                            {userLikedThemes.reverse().slice(0, displayCount).map((theme) => (
                                <div className="mb-4" key={theme.id}>
                                    <ThemeCard theme={theme} likedThemes={likedThemes} />
                                </div>
                            ))}
                            {displayCount < userLikedThemes.length && <div id="load-more" className="h-10 w-full bg-transparent" />}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <p className="text-md mt-4">No liked themes found</p>
                        </div>
                    )}
                </div>
            </div>
            <UserInfoCard />
        </Layout>
    );
}
