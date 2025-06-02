import { Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";

interface SearchBarProps {
    // eslint-disable-next-line no-unused-vars
    onSearch: (query: string) => void;
    className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
    return (
        <div className={cn("relative flex-1", className)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search themes..." className="pl-9 w-full h-[280px] bg-secondary border-none focus-visible:ring-1 focus-visible:ring-primary/50" onChange={(e) => onSearch(e.target.value)} />
        </div>
    );
}
