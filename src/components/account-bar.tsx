import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Switch } from "@components/ui/switch";
import { cn } from "@lib/utils";
import { type UserData } from "@types";
import { useAuth } from "@context/auth";

interface AccountBarProps {
    className?: string;
}

export function AccountBar({ className }: AccountBarProps) {
    const [user, setUser] = useState<UserData | object>({});
    const [isValid, setValid] = useState(null);
    const [endlessScroll, setEndlessScroll] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("endlessScroll") === "true" : false));
    const { authorizedUser, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        if (token) {
            setUser(authorizedUser);
            setValid(isAuthenticated);
        } else {
            setValid(isAuthenticated);
        }
    }, [authorizedUser, isAuthenticated, isLoading]);

    useEffect(() => {
        function deleteCookie(name: string) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }

        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        if (isValid === false && token) {
            deleteCookie("_dtoken");
        }
    }, [isValid]);

    const handleLogout = () => {
        document.cookie = "_dtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    };

    const toggleEndlessScroll = () => {
        const newValue = !endlessScroll;
        setEndlessScroll(newValue);
        console.log("%c[client/settings]", "color: #5865F2; background: #E5E5E5; padding: 4px 8px; border-radius: 4px;", `Endless Scroll: ${newValue}`);
        localStorage.setItem("endlessScroll", String(newValue));
    };

    return (
        <div>
            {isValid && user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={cn("flex items-center gap-2", className)}>
                            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                                <AvatarImage src={`https://cdn.discordapp.com/avatars/${(user as UserData)?.id}/${(user as UserData)?.avatar}.png`} />
                                <AvatarFallback>{(user as UserData)?.global_name}</AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => (window.location.href = "/users/@me")} className="transition-colors cursor-pointer">
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="transition-colors">
                            <div className="flex items-center justify-between w-full">
                                <span>Endless Scroll</span>
                                <Switch className="cursor-pointer" checked={endlessScroll} onCheckedChange={toggleEndlessScroll} />
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
