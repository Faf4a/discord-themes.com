"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@components/ui/carousel";
import { Card, CardContent } from "@components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { ThemeCard } from "./card";

interface Theme {
    id: string;
    name: string;
    release_date: string;
}

interface ThemeCarouselProps {
    themes?: Theme[];
}

export default function ThemeCarousel({ themes = [] }: ThemeCarouselProps) {
    const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);

    useEffect(() => {
        const sortedThemes = [...themes].sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()).slice(0, 10);
        setFilteredThemes(sortedThemes);
    }, [themes]);

    return (
        <div className="w-full relative">
            <Carousel
                plugins={[Autoplay({ delay: 3500 })]}
                opts={{
                    loop: true,
                    align: "start",
                    slidesToScroll: 1
                }}
                className="w-full"
            >
                <CarouselContent>
                    {filteredThemes.map((theme) => (
                        <CarouselItem key={theme.id} className="w-full sm:basis-full md:basis-1/2 md:pl-4">
                            <Card className="bg-transparent border border-muted">
                                <CardContent className="p-0">
                                     {/* @ts-ignore */}
                                    <ThemeCard theme={theme} noFooter diagonal lastUpdated />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
