import { useEffect } from "react";
import { useRouter } from "next/router";

const development = process.env.NODE_ENV === "development";

const redirect = development ? "https://discord.com/oauth2/authorize?client_id=1257819493422465235&response_type=code&redirect_uri=http://localhost:4321/api/user/auth?callback={CALLBACK}&scope=connections identify" : "https://discord.com/oauth2/authorize?client_id=1257819493422465235&response_type=code&redirect_uri=https://discord-themes.com/api/user/auth?callback={CALLBACK}&scope=connections identify";

export default function AuthCallback() {
    const router = useRouter();
    useEffect(() => {
        router.replace(redirect.replace("{CALLBACK}", router.query?.callback as string ?? "/auth/callback"));
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-2xl">Redirecting...</p>
        </div>
    );
}
