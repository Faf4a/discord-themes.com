import { AccountBar } from "@components/account-bar";
import App from "@components/page/theme-list";
import { useWebContext } from "@context/auth";

export default function ThemeSubmittedList() {
    const { authorizedUser, isLoading } = useWebContext();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">
                            <a href="/" className="hover:opacity-80 transition-opacity">
                                Theme Library
                            </a>
                        </h1>
                        <AccountBar className="ml-auto" />
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-3 flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-lg text-foreground">Loading...</div>
                ) : !authorizedUser?.admin ? (
                    <div className="text-center text-lg text-foreground">
                        You need to be an admin to view this page.
                        <div className="mt-2">
                            <a href="/" className="text-primary hover:underline">Return to home</a>
                        </div>
                    </div>
                ) : (
                    <App />
                )}
            </main>
        </div>
    );
}