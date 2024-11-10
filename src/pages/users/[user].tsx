import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ThemeCard } from "@components/theme/card";
import Image from "next/image";
import { SearchX } from "lucide-react";
import { type Theme } from "@types";
import { Button } from "@components/ui/button";
import { AccountBar } from "@components/account-bar";
import { useAuth } from "@context/auth";

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

    const [userThemes, setUserThemes] = useState<ThemesResponse>({ themes: [], user: { id: "", global_name: "", preferredColor: "", avatar: "" } });
    const [invalid, setInvalid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedThemes, setLikedThemes] = useState<Theme[]>([]);
    const [userLikedThemes, setUserLikedThemes] = useState<Theme[]>([]);
    const [activeTab, setActiveTab] = useState<"authored" | "liked">("authored");
    const { authorizedUser, isAuthenticated, isLoading, themes } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) router.push("/auth/login");

        function getCookie(name: string): string | undefined {
            if (typeof document === "undefined") return undefined;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const userToken = getCookie("_dtoken");

        if (userToken && user) {
            async function getThemes() {
                const response = await fetch(`/api/user/themes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: userToken, userId: user })
                });
                const request = await response.json();

                switch (response.status) {
                    case 200:
                        setUserThemes(request);
                        setLoading(false);
                        break;
                    case 404:
                        setInvalid(true);
                        setLoading(false);
                        break;
                    default:
                        setInvalid(false);
                        setLoading(false);
                        break;
                }
            }

            async function getLikedThemes() {
                const response = await fetch("/api/likes/get", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: userToken })
                }).then((res) => res.json());

                const likedThemeIds = response.likes.filter((like: { themeId: number; hasLiked: boolean }) => like.hasLiked).map((like: { themeId: number }) => like.themeId);

                const likedThemes = themes.filter((theme: Theme) => likedThemeIds.includes(theme.id));

                setUserLikedThemes(likedThemes);
                setLikedThemes(response);
            }

            getThemes();
            if (user === "@me" || user == authorizedUser.id) getLikedThemes();
        } else {
            setLoading(true);
        }
    }, [user, authorizedUser, isAuthenticated, isLoading, themes]);

    const Layout = ({ children }: { children: React.ReactNode }) => (
        <>
            <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-foreground flex-shrink-0">
                            <a href="/">Theme Library</a>
                        </h1>

                        <AccountBar className="ml-auto" />
                    </div>
                </div>
            </header>
            <div className="min-h-screen flex flex-col items-center pt-4 bg-background">
                <div className="flex flex-col-reverse md:flex-row w-full max-w-6xl gap-4 h-full pt-16 md:pt-0">{children}</div>
            </div>
        </>
    );

    const UserInfoCard = () => (
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
                    {(user === "@me" || user == authorizedUser.id) && (
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
                                {userThemes.themes.map((theme) => (
                                    <ThemeCard className="mb-2" likedThemes={likedThemes} disableDownloads key={theme.id} theme={theme} />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-card-foreground h-full justify-center">
                                <SearchX className="w-16 h-16 mb-4 text-muted-foreground" />
                                <p className="text-lg text-muted-foreground">This user doesn't have any themes yet</p>
                            </div>
                        )
                    ) : userLikedThemes.length > 0 ? (
                        <>
                            {userLikedThemes.map((theme) => (
                                <ThemeCard className="mb-2" likedThemes={likedThemes} disableDownloads key={theme.id} theme={theme} />
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-card-foreground h-full justify-center mt-2">
                            <SearchX className="w-16 h-16 mb-4 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">Nothing to see here</p>
                        </div>
                    )}
                </div>
            </div>
            <UserInfoCard />
        </Layout>
    );
}
