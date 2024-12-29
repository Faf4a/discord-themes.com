"use client";

import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { getCookie } from "@utils/cookies";
import { Loader2 } from "lucide-react";
import { Card } from "@components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Input } from "@components/ui/input";
import { SERVER } from "@constants";

interface Theme {
    _id: string;
    title: string;
    shortDescription: string;
    file: string;
    fileUrl: string;
    longDescription: string;
    contributors: string[];
    sourceLink: string;
    validatedUsers: {
        [key: string]: {
            id: string;
            username: string;
            avatar: string;
        };
    };
    themeContent: string;
    submittedAt: Date;
    submittedBy: string;
}

function ThemeList() {
    const { authorizedUser, isAuthenticated, isLoading } = useWebContext();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        console.log(authorizedUser);
        if (!isAuthenticated || !authorizedUser?.admin) {
            window.location.href = "/";
            return;
        }

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
                setThemes(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load themes");
            } finally {
                setLoading(false);
            }
        };

        fetchThemes();
    }, [isAuthenticated, authorizedUser]);

    const filteredThemes = themes.filter((theme) => theme.title.toLowerCase().includes(search.toLowerCase()) || Object.values(theme.validatedUsers).some((user) => user.username.toLowerCase().includes(search.toLowerCase())));

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-6">
                    <p className="text-red-500">Error: {error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Theme Submissions</h1>
                    <Input placeholder="Search themes..." className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <Card>
                </Card>
            </div>
        </div>
    );
}

export default ThemeList;
