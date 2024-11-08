import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { cn } from "@lib/utils";
import { type UserData } from "@types";

interface AccountBarProps {
    className?: string;
}

export function AccountBar({ className }: AccountBarProps) {
    const [user, setUser] = useState<UserData | object>({});
    const [isValid, setValid] = useState(null);

    useEffect(() => {
        function getCookie(name: string): string | undefined {
            const value = "; " + document.cookie;
            const parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop()?.split(";").shift();
        }

        const token = getCookie("_dtoken");

        async function fetchData() {
            const response = await fetch("/api/user/isAuthed", {
                method: "POST",
                body: JSON.stringify({ token: token as string }),
                headers: { "Content-Type": "application/json" }
            }).then((res) => res.json());
            setValid(response.authenticated ?? false);

            if (response.authenticated) {
                setUser(response.user);
            }
        }

        if (token) {
            fetchData();
        } else {
            setValid(false);
        }
    }, []);

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

    return (
        <div>
            {isValid && user && (
                <div className={cn("flex items-center gap-2", className)} onClick={() => (window.location.href = "/users/@me")}>
                    <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={`https://cdn.discordapp.com/avatars/${(user as UserData)?.id}/${(user as UserData)?.avatar}.png`} />
                        <AvatarFallback>{(user as UserData)?.global_name}</AvatarFallback>
                    </Avatar>
                </div>
            )}
        </div>
    );
}
