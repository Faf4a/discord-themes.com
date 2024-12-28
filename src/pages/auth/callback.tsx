import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthCallback() {
    const [redirected, setRedirected] = useState(false);
    const router = useRouter();
    const { token } = router.query;

    useEffect(() => {
        function setCookie(name: string, value: string, days: number) {
            const expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
        }

        if (token) {
            setCookie("_dtoken", token as string, 7);
        }

        if (localStorage.getItem("redirect")) {
            router.push(localStorage.getItem("redirect"));
            localStorage.removeItem("redirect");
            setRedirected(true);
        } else {
            if (!redirected) router.push("/");
            setRedirected(true);
        }
    }, [redirected, token, router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-2xl">Redirecting...</p>
        </div>
    );
}
