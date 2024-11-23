import { Button } from "@components/ui/button";
import blob from "/public/favicon.ico";
import Image from "next/image";
import { useEffect } from "react";

const ScreamsOfTheDoomed = () => {
    useEffect(() => {
        const favicon = document.getElementById("favicon");
        let x = 0;
        let y = 0;
        let dx = 2;
        let dy = 2;
        const faviconSize = 100;
        const moveFavicon = () => {
            x += dx;
            y += dy;
            if (x + faviconSize > window.innerWidth) {
                x = window.innerWidth - faviconSize;
                dx = -dx;
            } else if (x < 0) {
                x = 0;
                dx = -dx;
            }
            if (y + faviconSize > window.innerHeight) {
                y = window.innerHeight - faviconSize;
                dy = -dy;
            } else if (y < 0) {
                y = 0;
                dy = -dy;
            }
            favicon.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(moveFavicon);
        };
        moveFavicon();
    }, []);

    return (
        <>
            <Image id="favicon" src={blob} alt="Blob" width={100} height={100} className="border-sm absolute mx-auto w-[80px] sm:w-[100px] h-auto rounded-lg select-none pointer-events-none" />            <header className="sticky top-0 z-999 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex">
                        <h1 className="text-xl font-semibold">
                            <a href="/" className="hover:opacity-80 transition-opacity">
                                Theme Library
                            </a>
                        </h1>
                    </div>
                </div>
            </header>
            <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <h1 className="text-5xl sm:text-6xl font-bold">404</h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">Oops! The page you're looking for doesn't exist.</p>
                    <Button
                        size="lg"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Head Back
                    </Button>
                </div>
            </main>
        </>
    );
};

export default ScreamsOfTheDoomed;
