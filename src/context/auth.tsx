import { createContext, useContext } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";

const WebContext = createContext(null);

function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function AuthProvider({ children }) {
    const router = useRouter();
    const isAuthPath = router.pathname.startsWith("/auth");
    if (isAuthPath) console.log("%c[client/webcontext]", "color: #5865F2; background: #E5E5E5; padding: 4px 8px; border-radius: 4px;", "skipping auth check for path");

    const {
        data: authData,
        error: authError,
        mutate,
        isLoading: authLoading
    } = useSWR(
        !isAuthPath ? "/api/user/isAuthed" : null,
        async () => {
            const token = getCookie("_dtoken");
            if (!token) return null;

            const res = await fetch("/api/user/isAuthed", {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: Infinity
        }
    );

    if (authData) console.log("%c[server/auth]", "color: #5865F2; background: #E5E5E5; padding: 4px 8px; border-radius: 4px;", authData);

    const {
        data: themes,
        error: themesError,
        isLoading: themesLoading
    } = useSWR(
        !isAuthPath ? "/api/themes" : null,
        async () => {
            const res = await fetch("/api/themes");
            if (!res.ok) throw new Error("Failed to fetch themes");
            return res.json();
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: Infinity
        }
    );

    if (themes) console.log("%c[client/fetch]", "color: #5865F2; background: #E5E5E5; padding: 4px 8px; border-radius: 4px;", "themes fetched");
    
    return (
        <WebContext.Provider
            value={{
                authorizedUser: authData?.user,
                isAuthenticated: authData?.authenticated,
                isLoading: authLoading || themesLoading,
                error: authError || themesError,
                themes,
                mutate
            }}
        >
            {children}
        </WebContext.Provider>
    );
}

export const useWebContext = () => useContext(WebContext);
