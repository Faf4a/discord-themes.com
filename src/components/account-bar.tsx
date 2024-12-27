import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { UserIcon, LogOutIcon, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { cn } from "@lib/utils";
import { type UserData } from "@types";
import { useWebContext } from "@context/auth";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
interface AccountBarProps {
    className?: string;
}

export function AccountBar({ className }: AccountBarProps) {
    const [user, setUser] = useState<UserData | object>({});
    const [isValid, setValid] = useState(null);
    const { authorizedUser, isAuthenticated, isLoading } = useWebContext();

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

    return (
        <div>
            {isValid && user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={cn("flex items-center gap-2 hover:opacity-90 transition-all", className)}>
                            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                <AvatarImage src={`https://cdn.discordapp.com/avatars/${(user as UserData)?.id}/${(user as UserData)?.avatar}.png`} />
                                <AvatarFallback className="overflow-hidden">{(user as UserData)?.global_name}</AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
                        <div className="px-2 py-1.5 mb-2">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{(user as UserData)?.global_name}</p>
                                {(user as UserData)?.admin && (
                                    <Badge className="h-5 m-1 px-1.5 fill-current select-none">
                                        <Shield className="w-2.5 h-2.5 mr-1" />
                                        Admin
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{(user as UserData)?.id}</p>
                        </div>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => (window.location.href = "/users/@me")} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-md transition-colors">
                            <UserIcon className="h-4 w-4" />
                            My Profile
                        </DropdownMenuItem>
                        {(user as UserData).admin && (
                            <DropdownMenuItem disabled onClick={() => (window.location.href = "/admin")} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-md transition-colors">
                                <Shield className="h-4 w-4" />
                                Admin Panel
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                            <LogOutIcon className="h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                typeof window != "undefined" &&
                window.location.href === "/" && (
                    <Button
                        onClick={() => {
                            window.location.href = "/auth/login";
                        }}
                        disabled={isLoading}
                        className={cn("flex items-center gap-2 hover:opacity-90 transition-all", className)}
                    >
                        Login with Discord
                    </Button>
                )
            )}
        </div>
    );
}
