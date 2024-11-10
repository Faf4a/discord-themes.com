import Link from "next/link";
import { Button } from "@components/ui/button";
import blob from "/public/images/blob.png";
import Image from "next/image";

const ScreamsOfTheDoomed = () => {
    return (
        <>
            <header className="sticky top-0 z-999 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex">
                        <h1 className="text-xl font-semibold">
                            <a href="/" className="hover:opacity-80 transition-opacity">Theme Library</a>
                        </h1>
                    </div>
                </div>
            </header>
            <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <Image 
                        src={blob} 
                        alt="Blob" 
                        width={100}
                        height={100}
                        className="mx-auto w-[80px] sm:w-[100px] h-auto" 
                    />
                    <h1 className="text-5xl sm:text-6xl font-bold">404</h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Oops! The page you're looking for doesn't exist.
                    </p>
                    <Link href="/" className="block">
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="w-full sm:w-auto"
                        >
                            Head Back
                        </Button>
                    </Link>
                </div>
            </main>
        </>
    );
};

export default ScreamsOfTheDoomed;