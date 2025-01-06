"use client";

import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { getCookie } from "@utils/cookies";
import { Loader2 } from "lucide-react";
import { Card } from "@components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Input } from "@components/ui/input";
import { SERVER } from "@constants";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@components/ui/badge";

interface Theme {
    _id: string;
    title: string;
    description: string;
    file: string;
    fileUrl: string;
    contributors: string[];
    sourceLink: string;
    validatedUsers: {
        [key: string]: {
            id: string;
            username: string;
            avatar: string;
        };
    };
    state: "pending" | "approved" | "rejected";
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
                {/* Make header stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                    <h1 className="text-2xl font-bold">Theme Submissions</h1>
                    <Input 
                        placeholder="Search themes..." 
                        className="w-full sm:max-w-xs" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>

                {/* Add horizontal scroll for table on mobile */}
                <div className="overflow-x-auto">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Title</TableHead>
                                    <TableHead className="min-w-[250px]">Author</TableHead>
                                    <TableHead className="min-w-[200px]">Submitted</TableHead>
                                    <TableHead className="min-w-[150px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredThemes.map((theme) => (
                                    <TableRow key={theme._id}>
                                        <TableCell className="font-medium">
                                            {/* Add text wrapping for long titles */}
                                            <div className="break-words">{theme.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {[...Object.values(theme.validatedUsers)].reverse().map((user, index) => (
                                                    <div key={user.id}>
                                                        <div className="flex flex-row items-center gap-2 flex-wrap">
                                                            <img 
                                                                draggable={false} 
                                                                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                                                                alt={user.username} 
                                                                className="w-6 h-6 rounded-full select-none flex-shrink-0" 
                                                            />
                                                            <span className="break-all">{user.username}</span>
                                                            <p className="text-muted-foreground text-xs break-all">{user.id}</p>
                                                            {index === 0 && (
                                                                <Badge variant="default" className="whitespace-nowrap">
                                                                    Submitter
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(theme.submittedAt).toDateString()}
                                            <br className="sm:hidden" />
                                            <span className="text-sm text-muted-foreground">
                                                ({formatDistanceToNow(new Date(theme.submittedAt))} ago)
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <a 
                                                href={`${SERVER}/theme/submitted/view/${theme._id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-500 hover:underline inline-block"
                                            >
                                                {theme.state} (click to view)
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredThemes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            No themes found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ThemeList;
