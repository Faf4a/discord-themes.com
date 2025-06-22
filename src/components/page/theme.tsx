"use client";

import React, { useEffect, useState } from "react";
import { SearchBar } from "@components/search-bar";
import { ThemeGrid } from "@components/theme/grid";
import { Button } from "@components/ui/button";
import { FilterDropdown } from "@components/ui/filter-dropdown";
import { ArrowUp, Plus, SearchX, Info, ExternalLinkIcon } from "lucide-react";
import { getCookie } from "@utils/cookies";
import { type UserData } from "@types";
import { useWebContext } from "@context/auth";
import ThemeCarousel from "@components/theme/carousel";
import { DropdownFilter } from "@components/ui/dropdown-filter";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { type Theme } from "@types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { DiscordIcon } from "@utils/icons";

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
        <h3 className="font-semibold text-xl mb-2">No items found</h3>
        <p className="text-muted-foreground">Try adjusting your search query or filters</p>
    </div>
);

function App({ themes }: { themes: Theme[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isValid, setUser] = useState<UserData | boolean>(false);
    const [filters, setFilters] = useState([]);
    const [likedThemes, setLikedThemes] = useState([]);
    const [sort, setSort] = useState("most-popular");
    const { authorizedUser, isAuthenticated, isLoading, error } = useWebContext();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            setShowScrollTop(scrolled > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        if (isLoading) return;

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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
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

    const allFilters = isLoading
        ? []
        : [
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

    const themesOnly = themes.filter((t) => t.type === "theme");
    const snippetsOnly = themes.filter((t) => t.type === "snippet");

    const filteredThemes = isLoading
        ? []
        : themesOnly
              .filter((t) => {
                  t.downloads === undefined ? (t.downloads = 0) : (t.downloads = t.downloads);
                  t.likes === undefined ? (t.likes = 0) : (t.likes = t.likes);
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
                          return +new Date(b.last_updated) - +new Date(a.last_updated);
                      case "recently-uploaded":
                          return +new Date(b.release_date) - +new Date(a.release_date);
                      default:
                          return b.likes - a.likes;
                  }
              });

    const filteredSnippets = isLoading
        ? []
        : snippetsOnly
              .filter((t) => {
                  t.downloads === undefined ? (t.downloads = 0) : (t.downloads = t.downloads);
                  t.likes === undefined ? (t.likes = 0) : (t.likes = t.likes);
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
                          return +new Date(b.last_updated) - +new Date(a.last_updated);
                      case "recently-uploaded":
                          return +new Date(b.release_date) - +new Date(a.release_date);
                      default:
                          return b.likes - a.likes;
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
            <div className="container mx-auto px-4 py-6">
                <div className={`transform transition-all duration-300 ease-in-out overflow-hidden ${searchQuery === "" ? "opacity-100 translate-y-0 max-h-[500px]" : "opacity-0 -translate-y-10 max-h-0"} hidden md:block`}>
                    <div className="flex flex-col items-center">
                        <div className="relative inline-flex items-center justify-center">
                            <h2 className="text-xl font-semibold mb-3 mt-3 relative z-10">Recently Updated & Added</h2>
                        </div>
                        <ThemeCarousel themes={themesOnly} />
                    </div>
                </div>
                <div className="mb-3 mt-8">
                    <div className="flex justify-end mb-3">
                        <Button variant="outline" className="mr-4 hidden md:flex md:items-center" onClick={() => window.open("https://docs.vencord.dev/installing/", "_blank")}>
                            Install ThemeLibrary for Vencord
                            <ExternalLinkIcon className="ml-2 h-4 w-4" />
                        </Button>
                        <Button disabled={isLoading} onClick={handleSubmit} className="rounded-lg font-medium bg-[#4a63b4] hover:bg-[#3f58a3] text-white">
                            {isValid ? (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Submit Theme
                                </>
                            ) : (
                                <>
                                    Connect via Discord
                                    <DiscordIcon className="ml-2 h-4 w-4 fill-white" />
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-start">
                        <div className="md:col-span-2">
                            <SearchBar onSearch={setSearchQuery} />
                        </div>
                        <div className="md:col-span-1">
                            <FilterDropdown className={"hover:bg-muted"} options={allFilters} onChange={setFilters} />
                        </div>
                        <div className="md:col-span-1">
                            <DropdownFilter onChange={setSort} />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="themes" className="w-full mt-6">
                    <div className="w-full min-h-[44px] h-4 mb-8">
                        <TabsList className="bg-card w-full min-h-[44px] flex justify-start gap-2">
                            <TabsTrigger value="themes" className="flex-1">
                                Themes
                            </TabsTrigger>
                            <TabsTrigger value="snippets" className="flex-1">
                                Snippets
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="themes">
                        {isLoading ? (
                            <SkeletonGrid amount={6} />
                        ) : error ? (
                            <div className="text-red-500">Couldn't fetch any themes, if this error persists even after refreshing please report this error to my developer, thank you!: {error.message}</div>
                        ) : filteredThemes.length ? (
                            <ThemeGrid likedThemes={likedThemes as any as []} themes={filteredThemes} />
                        ) : (
                            <div>
                                <NoResults /> <SkeletonGrid amount={6} />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="snippets">
                        <div className="mb-4 text-sm text-muted-foreground"></div>

                        <Alert className="bg-card text-muted-foreground border border-border rounded-2xl shadow-sm mb-4">
                            <div className="flex items-start gap-3">
                                <Info className="mt-4 h-5 w-5 text-white" />
                                <div className="description mb-2">
                                    <AlertTitle className="font-semibold text-foreground">Heads up!</AlertTitle>
                                    <AlertDescription>Most snippets are made specifically for <a href="https://vencord.dev">Vencord</a> and may not work with other client mods.</AlertDescription>
                                </div>
                            </div>
                        </Alert>
                        {isLoading ? (
                            <SkeletonGrid amount={6} />
                        ) : error ? (
                            <div className="text-red-500">Error: {error.message}</div>
                        ) : filteredSnippets.length ? (
                            <ThemeGrid likedThemes={likedThemes as any as []} themes={filteredSnippets} />
                        ) : (
                            <div>
                                <NoResults /> <SkeletonGrid amount={6} />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {showScrollTop && (
                <Button variant="outline" size="icon" className="fixed bottom-8 right-8 rounded-full" onClick={scrollToTop}>
                    <ArrowUp className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

export default App;
