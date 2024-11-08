import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ThemeCard } from "@components/theme/card";
import { Skeleton } from "@components/ui/skeleton";
import { SearchX } from "lucide-react";
import { type Theme } from "@types";
import { Button } from "@components/ui/button";

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

    useEffect(() => {
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
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
            getThemes();
        } else {
            setLoading(true);
        }
    }, [user]);

    const Layout = ({ children }: { children: React.ReactNode }) => (
        <div className="min-h-screen flex flex-col items-center pt-4 bg-background">
            <div className="flex flex-col-reverse md:flex-row w-full max-w-6xl gap-4 h-full pt-16 md:pt-0">
                {children}
            </div>
        </div>
    );
    
    const UserInfoCard = () => (
        <div className="w-full md:w-1/3 bg-card rounded-lg h-full mt-4 md:mt-0 md:sticky md:top-4">
            <div className="w-full h-24" style={{ backgroundColor: userThemes.user.preferredColor }} />
            <div className="p-6 -mt-12 text-card-foreground">
                <div className="flex flex-col items-center">
                    <img
                        className="w-24 h-24 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background"
                        src={
                            userThemes.user.avatar
                                ? `https://cdn.discordapp.com/avatars/${userThemes.user.id}/${userThemes.user.avatar}.png`
                                : "https://cdn.discordapp.com/embed/avatars/5.png"
                        }
                        alt="Avatar"
                    />
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
                {!userThemes.user.global_name && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        The user has not migrated yet, therefore some data may be missing.
                    </div>
                )}
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
                    {userThemes.themes.length > 0 ? (
                        <>
                            {userThemes.themes.map((theme) => (
                                <ThemeCard className="mb-2" disableDownloads key={theme.id} theme={theme} />
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-card-foreground h-full justify-center">
                            <SearchX className="w-16 h-16 mb-4 text-muted-foreground" />
                            <p className="text-lg text-muted-foreground">This user doesn't have any themes yet</p>
                        </div>
                    )}
                </div>
            </div>
            <UserInfoCard />
        </Layout>
    );
}
