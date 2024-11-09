"use client";

import React, { useEffect, useState } from "react";
import { SearchBar } from "@components/search-bar";
import { ThemeGrid } from "@components/theme/grid";
import { AccountBar } from "@components/account-bar";
import { Button } from "@components/ui/button";
import { FilterDropdown } from "@components/ui/filter-dropdown";
import { Plus, Search, SearchX, X } from "lucide-react";
import { cn } from "@lib/utils";
import { type UserData } from "@types";
import { useAuth } from "@context/auth";

const THEMES_CACHE_KEY = "themes_cache";

const fetchThemes = async () => {
    const response = await fetch("/api/themes");
    return response.json();
};

const useThemes = () => {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cachedThemes = localStorage.getItem(THEMES_CACHE_KEY);
        if (cachedThemes) {
            setThemes(JSON.parse(cachedThemes));
            setLoading(false);
        } else {
            fetchThemes()
                .then((data) => {
                    setThemes(data);
                    localStorage.setItem(THEMES_CACHE_KEY, JSON.stringify(data));
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err);
                    setLoading(false);
                });
        }
    }, []);

    return { themes, loading, error };
};

const Skeleton = ({ className = "", ...props }) => <div className={`animate-pulse bg-muted/30 rounded ${className}`} {...props} />;

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-[280px] rounded-lg" />
        ))}
    </div>
);

const NoResults = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-xl mb-2">No themes found</h3>
        <p className="text-muted-foreground">Try adjusting your search query or filters</p>
    </div>
);

function App() {
    const { themes, loading, error } = useThemes();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isValid, setUser] = useState<UserData | boolean>(false);
    const [filters, setFilters] = useState([]);
    const [likedThemes, setLikedThemes] = useState([]);
    const { authorizedUser, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");


        

        async function getLikedThemes() {
            const response = await fetch("/api/likes/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token as string })
            }).then((res) => res.json());

            setLikedThemes(response);
        }

        if (token && isAuthenticated) {
            setUser(authorizedUser);
            getLikedThemes();
        } else {
            setUser(false);
        }
    }, [isLoading, authorizedUser, isAuthenticated]);

    const allFilters = [
        ...themes.reduce((acc, theme) => {
            theme.tags.forEach((tag) => acc.set(tag, (acc.get(tag) || 0) + 1));
            return acc;
        }, new Map())
    ]
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([tag]) => ({
            value: tag,
            label: tag.charAt(0).toUpperCase() + tag.slice(1)
        }));

    const filteredThemes = themes.filter((theme) => {
        const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || theme.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters =
            filters.length === 0 ||
            filters.every((filter) => theme.tags.includes(filter.value));

        return matchesSearch && matchesFilters;
    });

    const handleSubmit = () => {
        if (isValid) {
            window.location.href = "/theme/submit";
        } else {
            window.location.href = "/auth/login";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <h1 className={cn("text-xl font-semibold text-foreground transition-opacity flex-shrink-0", isSearchExpanded && "hidden md:block")}>
                            <a href="/">Theme Library</a>
                        </h1>

                        <div className={cn("flex-1 max-w-xl transition-all duration-200", isSearchExpanded ? "absolute top-0 left-0 right-0 z-50 bg-background p-4 md:relative md:bg-transparent md:p-0" : "hidden md:block")}>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                {isSearchExpanded && (
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchExpanded(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                )}
                                <SearchBar onSearch={setSearchQuery} className={cn("w-full", isSearchExpanded && "md:max-w-xl")} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchExpanded(true)}>
                                <Search className="h-5 w-5" />
                            </Button>
                            <AccountBar className={cn("transition-opacity", isSearchExpanded && "hidden md:block")} />
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FilterDropdown options={allFilters} placeholder="Filter results..." emptyMessage="No filters found" onChange={setFilters} />
                        <span className="text-sm text-muted-foreground hidden sm:block">{filteredThemes.length} themes</span>
                    </div>
                    <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                        {isValid ? (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Submit Theme
                            </>
                        ) : (
                            "Login with Discord"
                        )}
                    </Button>
                </div>
                {loading ? (
                    <SkeletonGrid />
                ) : error ? (
                    <div className="text-red-500">Error: {error.message}</div>
                ) : filteredThemes.length ? (
                    <ThemeGrid likedThemes={likedThemes as any as []} themes={filteredThemes} />
                ) : (
                    <div>
                        <NoResults /> <SkeletonGrid />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
