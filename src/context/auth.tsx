// src/context/auth.tsx
import { createContext, useContext } from "react";
import useSWR from "swr";

const AuthContext = createContext(null);

function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function AuthProvider({ children }) {
    const { data, error, mutate, isLoading } = useSWR(
        "/api/user/isAuthed",
        async () => {
            const token = getCookie("_dtoken");
            if (!token) return null;

            const res = await fetch("/api/user/isAuthed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            return res.json();
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000
        }
    );

    console.log("[server/auth]", data);
    console.log("[server/auth]", error);
    console.log("[server/auth]", isLoading);

    return (
        <AuthContext.Provider
            value={{
                authorizedUser: data?.user,
                isAuthenticated: data?.authenticated,
                isLoading,
                error,
                mutate
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);