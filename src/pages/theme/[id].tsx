"use client";

import { useRouter } from 'next/router';
import App from "@components/page/theme-info"

export default function ThemePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <App id={id as any as string} />
  );
}
