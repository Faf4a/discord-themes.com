import { Carousel, CarouselContent, CarouselItem } from "@components/ui/carousel";
import { type FC, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ThemeCard } from "./card";

interface Theme {
  id: string;
  name: string;
  release_date: string;
}

interface ThemeCarouselProps {
  themes: Theme[];
}

const ThemeCarousel: FC<ThemeCarouselProps> = ({ themes }) => {
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);

  useEffect(() => {
    const sortedThemes = [...themes]
      .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
      .slice(0, 5);
    setFilteredThemes(sortedThemes);
  }, [themes]);

  return (
    <Carousel plugins={[Autoplay({ delay: 3000 })]}>
      <CarouselContent>
        {filteredThemes.map((theme) => (
          <CarouselItem key={theme.id}>
            {/* @ts-ignore */}
            <ThemeCard theme={theme} noFooter />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default ThemeCarousel;
