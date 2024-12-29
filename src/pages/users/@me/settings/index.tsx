import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@components/ui/alert-dialog";
import { Settings, UserCircle, Eye, Copy, RefreshCw, User, Hash, Github } from "lucide-react";
import { deleteCookie, getCookie, setCookie } from "@utils/cookies";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@hooks/use-toast";
import { Skeleton } from "@components/ui/skeleton";
import { useWebContext } from "@context/auth";
import { useRouter } from "next/router";
import { AccountBar } from "@components/account-bar";
import { Alert, AlertTitle, AlertDescription } from "@components/ui/alert";

export default function SettingsPage() {
    const { isAuthenticated, isLoading } = useWebContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
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
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <Tabs defaultValue="account" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="account">
                            <Settings className="w-4 h-4 mr-2" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="data">
                            <UserCircle className="w-4 h-4 mr-2" />
                            User Data
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>Manage your account settings and preferences.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mb-4">
                                    <h2 className="text-xl font-semibold">API Key</h2>
                                    <Alert className="border-yellow-600/20 bg-yellow-500/10">
                                        <AlertTitle className="text-md font-semibold text-yellow-500">Access to your Account Token</AlertTitle>
                                        <AlertDescription className="text-yellow-500/90 text-sm">
                                            <p className="text-sm text-muted-foreground">
                                                Your API key is a secure token that identifies your account. It grants access to:
                                                <ul className="list-disc list-inside mt-2 space-y-1">
                                                    <li>Managing your themes</li>
                                                    <li>Accessing account settings</li>
                                                    <li>Performing automated actions</li>
                                                </ul>
                                                <span className="block mt-2">
                                                    This is <b>not</b> your Discord Account token, however, still, do not share it with anyone who you don't trust.
                                                </span>
                                            </p>
                                        </AlertDescription>
                                    </Alert>
                                    <APIKey />
                                </div>
                                <DeleteAccount />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="data">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Data</CardTitle>
                                <CardDescription>View the data associated with your account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserData />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

function DeleteAccount() {
    const [deleteText, setDeleteText] = useState("");
    const { authorizedUser } = useWebContext();
    const { toast } = useToast();

    const handleDelete = async () => {
        const response = await fetch("/api/user/delete", {
            method: "DELETE",
            body: JSON.stringify({
                userId: authorizedUser?.id
            }),
            headers: {
                Authorization: `Bearer ${getCookie("_dtoken")}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            toast({
                title: "Error",
                description: "Failed to delete your account & themes.",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Account Deleted",
            description: "Your account & themes have been permanently deleted."
        });
        deleteCookie("_dtoken");
        window.location.href = "/";
    };

    const handleLogout = async () => {
        const response = await fetch("/api/user/revoke", {
            method: "DELETE",
            body: JSON.stringify({
                userId: authorizedUser?.id
            }),
            headers: {
                Authorization: `Bearer ${getCookie("_dtoken")}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            toast({
                title: "Failed to Logout",
                description: (await response.json()).message,
                variant: "destructive"
            });
            return;
        }
        await deleteCookie("_dtoken");
        toast({
            title: "Success",
            description: "You have been logged out & your account data has been deleted."
        });
        window.location.href = "/";
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Delete Account</h2>
            <Alert className="border-red-600/20 bg-red-500/10">
                <AlertTitle className="text-md font-semibold text-red-500">Deleting your Account</AlertTitle>
                <AlertDescription className="text-red-500/90 text-sm">
                    <p className="text-sm text-muted-foreground">
                        This will delete your account including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All your submitted themes</li>
                            <li>All liked themes</li>
                            <li>Other data associated with your account</li>
                        </ul>
                        <div className="flex items-center gap-2 mt-2">
                            <span>If you don't want your themes to be deleted, you can revoke the authorization instead below.</span>
                            <b>This action cannot be undone.</b>
                        </div>
                    </p>
                </AlertDescription>
            </Alert>

            {authorizedUser?.admin && (
                <Alert className="border-yellow-600/20 bg-yellow-500/10">
                    <AlertDescription className="text-yellow-500/90 text-sm">
                        <p className="text-sm text-muted-foreground">You are an admin, you cannot delete your account. Please contact us via Discord.</p>
                    </AlertDescription>
                </Alert>
            )}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button disabled={false} variant="destructive">
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            <div className="mt-2 mb-2">
                                This will, <span className="text-red-500">delete all your submitted themes, liked themes, and other data associated with your account</span>. <b>EVERYTHING.</b>
                            </div>
                            <div className="mt-2 mb-2 text-xs text-muted-foreground">This does not affect your Discord Account in any way.</div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Alert className="border-red-600/20 bg-red-500/10">
                            <AlertTitle className="text-md font-semibold text-red-500">Deleting your Account</AlertTitle>
                            <AlertDescription className="text-red-500/90 text-sm">
                                <p className="text-sm text-muted-foreground">
                                    Type <b>DELETE</b> to confirm
                                </p>
                            </AlertDescription>
                        </Alert>
                        <Input id="confirm-delete" placeholder="DELETE" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={deleteText !== "DELETE"} onClick={handleDelete}>
                            Delete Account & All Themes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button disabled={authorizedUser?.admin ?? false} className="ml-2" variant="outline">
                        Revoke Authorization
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Invalidate your current API Key</li>
                                <li>Log you out</li>
                                <li>Delete your account data</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function UserData() {
    const [loading, setLoading] = useState(false);
    const { authorizedUser } = useWebContext();
    const { toast } = useToast();
    const router = useRouter();

    const refreshData = async () => {
        setLoading(true);
        router.push("/auth/login");
        localStorage.setItem("redirect", "/users/@me/settings");

        try {
            toast({
                title: "Redirecting...",
                description: "Redirecting you to discord for authentication."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh user data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const userFields: Array<{ icon: any; label: string; value: any; href?: string }> = [
        { icon: Hash, label: "User ID", value: authorizedUser?.id },
        { icon: User, label: "Username", value: authorizedUser?.global_name }
    ];

    authorizedUser?.social?.github && userFields.push({ icon: Github, label: "GitHub", href: `https://github.com/${authorizedUser.social.github}`, value: authorizedUser?.social?.github });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Refreshing will redirect you to Discord as we do not save any access/refresh tokens or similar, this is the only way to update your data.</p>
                <Button onClick={refreshData} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Refreshing..." : "Refresh"}
                </Button>
            </div>
            <div className="grid gap-6 p-6 border border-muted rounded-lg bg-card">
                {loading ? (
                    <div className="space-y-4">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userFields.map((field, index) => (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <field.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <dt className="text-sm font-medium leading-none mb-1">{field.label}</dt>
                                    {field.href ? (
                                        <a href={field.href} target="_blank" rel="noreferrer" className="text-sm text-accent">
                                            <dd className="text-sm text-muted-foreground">{field.value || "—"}</dd>
                                        </a>
                                    ) : (
                                        <dd className="text-sm text-muted-foreground">{field.value || "—"}</dd>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function APIKey() {
    const [isVisible, setIsVisible] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const { toast } = useToast();
    const { authorizedUser } = useWebContext();

    useEffect(() => {
        const token = getCookie("_dtoken");
        if (!token) return;
        setApiKey(token);
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(apiKey);
            toast({
                title: "Copied!",
                description: "API key copied to clipboard"
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy API key",
                variant: "destructive"
            });
        }
    }, [apiKey, toast]);

    const handleRefresh = async () => {
        if (cooldown) return;
        setIsRefreshing(true);
        setCooldown(true);

        try {
            const response = await fetch("/api/user/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    userId: authorizedUser?.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCookie("_dtoken", data.token);
                setApiKey(data.token);
                toast({
                    title: "Success",
                    description: "API key has been refreshed"
                });
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to refresh API key",
                variant: "destructive"
            });
        } finally {
            setIsRefreshing(false);
            setTimeout(() => setCooldown(false), 5000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex space-x-2">
                    <div className="relative flex-grow">
                        <Input id="api-key" type={isVisible ? "text" : "password"} value={apiKey} readOnly className="pr-10 font-mono" />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setIsVisible(!isVisible)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                    <Button onClick={handleRefresh} disabled={isRefreshing || cooldown}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
