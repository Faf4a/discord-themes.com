"use client";

import React, { useEffect, useState } from "react";
import { useWebContext } from "@context/auth";
import { getCookie } from "@utils/cookies";
import { Search } from "lucide-react";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { SERVER } from "@constants";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

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
    const [filter, setFilter] = useState("all");

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

    useEffect(() => {
        if (!isAuthenticated || !authorizedUser?.admin) {
            window.location.href = "/";
            return;
        }

        fetchThemes();
    }, [isAuthenticated, authorizedUser]);

    const handleApproveOrReject = async (themeId: string, newState: "approved" | "rejected") => {
        try {
            const response = await fetch(`/api/update/theme-state/${themeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getCookie("_dtoken")}`
                },
                body: JSON.stringify({ state: newState })
            });

            if (!response.ok) {
                throw new Error("Failed to update theme state");
            }

            // Refetch themes after updating the state
            await fetchThemes();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update theme state");
        }
    };

    const filteredThemes = themes.filter((theme) => {
        const matchesSearch = theme.title.toLowerCase().includes(search.toLowerCase()) || Object.values(theme.validatedUsers).some((user) => user.username.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filter === "all" || theme.state === filter;
        return matchesSearch && matchesFilter;
    });

    if (isLoading || loading) {
        return (
            <div className="min-h-screen p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center">
                <Card className="p-6 max-w-md w-full">
                    <p className="text-red-500 text-center">Error: {error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold">Theme Submissions</h1>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="Search themes or authors..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {filteredThemes.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No themes found matching your criteria</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredThemes.map((theme) => (
                            <Card key={theme._id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-semibold text-lg break-words">{theme.title}</h3>
                                        <Badge variant={theme.state === "approved" ? "default" : theme.state === "rejected" ? "destructive" : "default"}>{theme.state}</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        {Object.values(theme.validatedUsers)
                                            .reverse()
                                            .map((user, index) => (
                                                <div key={user.id} className="flex items-center gap-2">
                                                    <img draggable={false} src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt={user.username} className="w-8 h-8 rounded-full" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{user.username}</p>
                                                        <p className="text-sm text-gray-500 truncate">{user.id}</p>
                                                    </div>
                                                    {index === 0 && (
                                                        <Badge variant="outline" className="flex-shrink-0">
                                                            Submitter
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                    </div>

                                    <div className="pt-2 border-t border-muted">
                                        <p className="text-sm text-gray-500">Submitted {formatDistanceToNow(new Date(theme.submittedAt))} ago</p>
                                        <a href={`${SERVER}/theme/submitted/view/${theme._id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                                            View Details →
                                        </a>
                                    </div>

                                    {/* Approve/Reject Buttons */}
                                    {theme.state === "pending" && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveOrReject(theme._id, "approved")} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                                Approve
                                            </button>
                                            <button onClick={() => handleApproveOrReject(theme._id, "rejected")} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThemeList;
