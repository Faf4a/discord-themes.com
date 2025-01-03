import { Button } from "@components/ui/button";
import { useEffect } from "react";

const ScreamsOfTheDoomed = () => {
    useEffect(() => {
        const favicon = document.getElementById("favicon");
        let x = 0;
        let y = 0;
        let dx = 2;
        let dy = 2;
        const faviconSize = 100;
        favicon.classList.remove('hidden');
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
