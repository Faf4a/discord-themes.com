import { useEffect, useState } from "react";
import { StatsSection } from "@components/ui/stats-section";
import { Download, Users, Paintbrush, Eye } from "lucide-react";

export default function StatsPage() {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        async function fetchData() {
            "use cache";

            const response = await fetch("/api/internal");
            const data = await response.json();

            const formattedStats = [
                { title: "Total Users", value: data.users.total.toString(), icon: Users },
                { title: "Monthly Users", value: data.users.monthly.count.toString(), icon: Users },
                { title: "Theme Count", value: data.themes.total.toString(), icon: Paintbrush },
                { title: "Total Downloads", value: data.themes.totalDownloads.toString(), icon: Download },
                { title: "Most Liked Theme", value: data.themes.mostLiked, icon: Eye }
            ];

            setStats(formattedStats);
        }

        fetchData();
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-999 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex">
                        <h1 className="text-xl font-bold">
                            <a href="/" className="hover:opacity-80 transition-opacity">
                                Theme Library
                            </a>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="container py-10 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">About ThemeLibrary</h1>
                        <p className="text-muted-foreground">ThemeLibrary was created for fun, but also to address the gap left by inactive theme websites. We aim to provide a vibrant community for theme creators and users alike.</p>
                    </div>
                    <StatsSection stats={stats} />
                </section>
            </main>
        </div>
    );
}