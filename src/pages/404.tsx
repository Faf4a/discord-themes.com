/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Button } from "@components/ui/button";
import { AlertTriangle } from "lucide-react";

const ScreamsOfTheDoomed = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4 transform rotate-12 opacity-75" />
            <h1 className="text-6xl font-bold">404</h1>
            <p className="mt-4 text-xl inline-block">Oops! The page you're looking for doesn't exist.</p>
            <Link href="/">
                <Button size="lg" variant="outline" className="mt-6">
                    Head Back
                </Button>
            </Link>
        </div>
    );
};

export default ScreamsOfTheDoomed;
