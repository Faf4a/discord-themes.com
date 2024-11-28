"use client";

import React, { useEffect, useState } from "react";
import { SearchBar } from "@components/search-bar";
import { ThemeGrid } from "@components/theme/grid";
import { AccountBar } from "@components/account-bar";
import { Button } from "@components/ui/button";
import { FilterDropdown } from "@components/ui/filter-dropdown";
import { CalendarPlus, Plus, Search, SearchX, X } from "lucide-react";
import { cn } from "@lib/utils";
import { type UserData } from "@types";
import { useWebContext } from "@context/auth";
import ThemeCarousel from "@components/theme/carousel";
import { DropdownFilter } from "@components/ui/dropdown-filter";

const Skeleton = ({ className = "", ...props }) => <div className={`animate-pulse bg-muted/30 rounded ${className}`} {...props} />;

const SkeletonGrid = ({ amount = 6 }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const displayAmount = isMobile ? Math.min(2, amount) : amount;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(displayAmount)].map((_, i) => (
                <Skeleton key={i} className="w-full h-[280px] rounded-lg" />
            ))}
        </div>
    );
};

const NoResults = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-xl mb-2">No themes found</h3>
        <p className="text-muted-foreground">Try adjusting your search query or filters</p>
    </div>
);

function App() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isValid, setUser] = useState<UserData | boolean>(false);
    const [filters, setFilters] = useState([]);
    const [likedThemes, setLikedThemes] = useState([]);
    const [sort, setSort] = useState("most-popular");
    const { authorizedUser, isAuthenticated, isLoading, error, themes } = useWebContext();
    
    useEffect(() => {
        if (isLoading) return;
    
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }
    
        const token = getCookie("_dtoken");
    
        async function getLikedThemes() {
            const cachedLikedThemes = localStorage.getItem("likedThemes");
            const cacheTime = localStorage.getItem("ct");
            const now = Date.now();
    
            if (cachedLikedThemes && cacheTime && now - parseInt(cacheTime, 10) < 3600000) {
                setLikedThemes(JSON.parse(cachedLikedThemes));
                return;
            }
    
            const response = await fetch("/api/likes/get", {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            }).then((res) => res.json());
    
            localStorage.setItem("likedThemes", JSON.stringify(response));
            localStorage.setItem("ct", now.toString());
            setLikedThemes(response);
        }
    
        if (token && isAuthenticated) {
            setUser(authorizedUser);
            getLikedThemes();
        } else {
            setUser(false);
        }
    }, [isLoading, authorizedUser, isAuthenticated]);
    
    const allFilters = isLoading ? [] : [
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
    
    const filteredThemes = isLoading ? [] : themes
        .filter((t) => {
            const match = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const tags = filters.length === 0 || filters.every((f) => t.tags.includes(f.value));
            return match && tags;
        })
        .sort((a, b) => {
            switch (sort) {
                case "most-liked":
                    return b.likes - a.likes;
                case "most-popular":
                    return b.downloads - a.downloads;
                case "recently-updated":
                    return +new Date(b.updated_at) - +new Date(a.updated_at);
                case "recently-uploaded":
                    return +new Date(b.created_at) - +new Date(a.created_at);
                default:
                    return 0;
            }
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
                        <div className={cn("flex-1 max-w-xl transition-all duration-200", isSearchExpanded ? "absolute top-0 left-0 right-0 z-50 bg-background p-4 md:relative md:bg-transparent md:p-0 flex items-center" : "hidden md:block")}>
                            {isSearchExpanded && (
                                <div className="flex items-center w-full">
                                    <SearchBar onSearch={setSearchQuery} className="w-full" />
                                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsSearchExpanded(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}
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
                <div className={`transform transition-all duration-300 ease-in-out overflow-hidden ${searchQuery === "" ? "opacity-100 translate-y-0 max-h-[500px]" : "opacity-0 -translate-y-10 max-h-0"} hidden md:block`}>
                    <div className="flex flex-col items-center">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="opacity-30 transform rotate-12">
                                <CalendarPlus size={25} className="text-primary mr-2" />
                            </div>
                            <h2 className="text-xl font-semibold mb-3 mt-3 relative z-10">Recently Updated</h2>
                        </div>
                        <ThemeCarousel themes={themes} />
                    </div>
                    <div className="border-t border-1 border-muted rounded-lg m-4"></div>
                </div>
                <div className="mb-3 mt-3">
                    <div className="flex justify-end mb-3">
                        <Button disabled={isLoading} onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
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
                    <div className="flex mb-4 flex-col md:flex-row md:items-center md:gap-4 w-full">
                        <div className="mb-3 md:mb-0 flex-grow md:flex-grow-[2/3]">
                            <SearchBar onSearch={setSearchQuery} />
                        </div>
                        <div className="flex items-center gap-2 md:flex-grow-[1/3]">
                            <FilterDropdown options={allFilters} placeholder="Filter tags..." emptyMessage="No tags found" onChange={setFilters} />
                            <DropdownFilter onChange={setSort} />
                        </div>
                    </div>
                </div>
                {isLoading ? (
                    <SkeletonGrid amount={6} />
                ) : error ? (
                    <div className="text-red-500">Error: {error.message}</div>
                ) : filteredThemes.length ? (
                    <ThemeGrid likedThemes={likedThemes as any as []} themes={filteredThemes} />
                ) : (
                    <div>
                        <NoResults /> <SkeletonGrid amount={6} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
