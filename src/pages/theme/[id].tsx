"use client";

import { useRouter } from "next/router";
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import App from "@components/page/theme-info";
import { type Theme } from "@types";

export const getStaticPaths: GetStaticPaths = async () => {
    const res = await fetch("https://raw.githubusercontent.com/Faf4a/stunning-spoon/refs/heads/main/themes.json");
    const themes = await res.json();

    const paths = themes.map((theme: Theme) => ({
        params: { id: String(theme.id) }
    }));

    return {
        paths,
        fallback: "blocking"
    };
};

// eslint-disable-next-line no-unused-vars
export const getStaticProps = (async (context) => {
    const res = await fetch("https://raw.githubusercontent.com/Faf4a/stunning-spoon/refs/heads/main/themes.json");
    const themes = await res.json();
    return { props: { themes }, revalidate: 60 };
}) satisfies GetStaticProps<{
    themes: Theme[];
}>;

export default function ThemePage({ themes }: InferGetStaticPropsType<typeof getStaticProps>) {
    const router = useRouter();
    const { id } = router.query;

    const theme = themes.find((x) => x.id == id);

    return <App id={id as string} theme={theme} />;
}
