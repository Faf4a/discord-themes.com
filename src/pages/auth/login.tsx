import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const development = process.env.NODE_ENV === "development";

const redirect = development ? "https://discord.com/oauth2/authorize?client_id=1257819493422465235&response_type=code&redirect_uri=https://literate-engine-rv7579wprjq2px77-4321.app.github.dev/api/user/auth?callback={CALLBACK}&scope=connections identify" : "https://discord.com/oauth2/authorize?client_id=1257819493422465235&response_type=code&redirect_uri=https://discord-themes.com/api/user/auth?callback={CALLBACK}&scope=connections identify";

export default function AuthCallback() {
    const router = useRouter();
    useEffect(() => {
        router.replace(redirect.replace("{CALLBACK}", (router.query?.callback as string) ?? "/auth/callback"));
    }, [router]);

    return (
        <>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <meta name="keywords" content="discord theme login, discord authentication, theme library login, discord themes account, secure discord themes" />
                <meta name="theme-color" content="#5865F2" />
                <meta name="application-name" content="Theme Library" />
                <meta name="description" content="Sign in to Theme Library using your Discord account. Access and manage your Discord themes collection securely." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://discord-themes.com/" />
                <meta property="og:title" content="Sign in with Discord | Theme Library" />
                <meta property="og:description" content="Connect your Discord account to access Theme Library. Browse, submit, and manage your Discord themes collection." />
                <title>Sign in with Discord | Theme Library</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="flex justify-center items-center min-h-screen">
                <p className="text-2xl">Redirecting...</p>
            </div>
        </>
    );
}
