"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWebContext } from "@context/auth";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Clock, Download, FileCode, Loader2, Users } from "lucide-react";
import { getCookie } from "@utils/cookies";

interface InternalStats {
    users: {
        monthly: {
            count: number;
            timeframe: string;
        };
        total: number;
    };
    themes: {
        total: number;
        totalDownloads: number;
        topAuthor: {
            discord_snowflake: string;
            themeCount: number;
        };
        mostLiked: string;
    };
    dbst: {
        collections: number;
        objects: number;
        dataSize: number;
        storageSize: number;
        indexes: number;
        size: number;
    };
    sst: {
        cn: any;
        nw: any;
        op: any;
        up: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { isAuthenticated, authorizedUser, isLoading } = useWebContext();
    const [stats, setStats] = useState<InternalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !authorizedUser?.admin)) {
            router.push("/");
            return;
        }

        const fetchStats = async () => {
            try {
                const token = getCookie("_dtoken");
                if (!token) {
                    router.push("/");
                    return;
                }

                const response = await fetch("/api/internal", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    router.push("/");
                }
            } catch {
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, authorizedUser, isLoading, router]);

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !authorizedUser?.admin) {
        return null;
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Site Statistics</h1>
                <Button onClick={() => router.push("/theme/submitted")}>View Theme Submissions</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users.total}</div>
                        <p className="text-xs text-muted-foreground">{stats?.users.monthly.count} new this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.themes.total}</div>
                        <p className="text-xs text-muted-foreground">Top author: {stats?.themes.topAuthor.themeCount} themes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.themes.totalDownloads}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.floor(stats?.sst.up / 86400)} days</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Database Statistics</CardTitle>
                        <CardDescription>Current database metrics and usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <h3 className="text-sm font-medium">Collections</h3>
                                <p className="text-2xl font-bold">{stats?.dbst.collections}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium">Objects</h3>
                                <p className="text-2xl font-bold">{stats?.dbst.objects}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium">Data Size</h3>
                                <p className="text-2xl font-bold">{formatBytes(stats?.dbst.dataSize)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium">Storage Size</h3>
                                <p className="text-2xl font-bold">{formatBytes(stats?.dbst.storageSize)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
