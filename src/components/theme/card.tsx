/* eslint-disable @next/next/no-img-element */
import { Check, Download, Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { MouseEvent, useEffect, useState } from "react";
import { type Theme } from "@types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface ThemeCardProps {
    theme: Theme;
    likedThemes: any;
    className?: string;
    disableDownloads?: boolean;
}

export function ThemeCard({ theme, likedThemes, className, disableDownloads = false }: ThemeCardProps) {
    const [isLiked, setLiked] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    useEffect(() => {
        if (likedThemes?.likes?.length) {
            const hasLiked = likedThemes.likes.some((liked) => liked.themeId === theme.id);
            setLiked(hasLiked);
        }
    }, [likedThemes, theme]);

    const handleDownload = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDownloaded(true);

        // /api/download/:id
        window.location.href = `/api/download/${theme.id}`;

        setTimeout(() => {
            setIsDownloaded(false);
        }, 5000);
    };

    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    return (
        <Card className={cn("group overflow-hidden flex flex-col justify-between h-full transition-all hover:translate-y-[-1px] border-border/40 bg-card", className)} onMouseLeave={handleMouseLeave}>
            <Link href={`/theme/${Number(theme.id)}`}>
                <div className="flex flex-col h-full">
                    <CardHeader className="p-0 relative">
                        <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                            <Image priority width={854} height={480} src={theme.thumbnail_url} alt={theme.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="absolute bottom-2 left-2 z-2 flex flex-wrap gap-1.5">
                            {theme.tags?.slice(0, 3).map((tag) => (
                                <Button key={tag} variant="outline" size="sm" className="text-[10px] h-6 px-2 bg-card/80 backdrop-blur-sm" onClick={(e) => e.preventDefault()}>
                                    {tag}
                                </Button>
                            ))}
                            {theme.tags && theme.tags.length > 3 && (
                                <Popover open={isOpen} onOpenChange={setIsOpen}>
                                    <div onMouseEnter={handleMouseEnter}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={(e) => e.preventDefault()} className="text-[10px] h-6 px-2 bg-card/80 backdrop-blur-sm">
                                                +{theme.tags.length - 3}
                                            </Button>
                                        </PopoverTrigger>
                                    </div>
                                    <PopoverContent className="w-auto p-2 border-border/40 bg-card">
                                        <div className="flex flex-wrap gap-1.5">
                                            {theme.tags.slice(3).map((tag) => (
                                                <Button key={tag} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={(e) => e.preventDefault()}>
                                                    {tag}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="text-base font-medium tracking-tight text-foreground">{theme.name}</h3>
                        <ReactMarkdown className="description text-sm text-muted-foreground mt-1" remarkPlugins={[remarkGfm]}>
                            {theme.description}
                        </ReactMarkdown>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto">
                        <div className="flex justify-between items-center w-full">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                                <div className={cn("flex items-center", isLiked && "text-primary")}>
                                    <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                                    <span>{theme.likes}</span>
                                </div>
                                <div className="flex items-center ml-2">
                                    <Download className="h-4 w-4 mr-2" />
                                    <span>{theme?.downloads ?? 0}</span>
                                </div>
                            </Button>
                            {!disableDownloads && (
                                <Button disabled={isDownloaded} size="sm" className="bg-primary hover:bg-primary/90" onClick={handleDownload}>
                                    {isDownloaded ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Downloaded
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </div>
            </Link>
        </Card>
    );
}
