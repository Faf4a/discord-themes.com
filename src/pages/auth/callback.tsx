import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { setCookie } from "@utils/cookies";

export default function AuthCallback() {
    const [redirected, setRedirected] = useState(false);
    const router = useRouter();
    const { token } = router.query;

    useEffect(() => {
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
