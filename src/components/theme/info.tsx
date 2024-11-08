import React from "react";
import { type Theme } from "@types";
import Image from "next/image";

export function ThemePage({ theme }: { theme: Theme }) {
    return (
        <div className="flex flex-col lg:flex-row p-4 max-w-5xl mx-auto">
            <div className="w-full lg:w-2/3 p-4">
                <h1 className="text-2xl font-bold mb-2">{theme.name}</h1>
                <p className="text-sm text-gray-600 mb-4 description">{theme.description}</p>
                <div className="border border-gray-300 bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                    {/*eslint-disable-next-line @next/next/no-img-element*/}
                    <Image fill={true} src={theme.thumbnail_url} alt={`${theme.name} thumbnail`} className="object-cover w-full h-full rounded-lg" />
                </div>
            </div>

            <div className="w-full lg:w-1/3 p-4 bg-gray-50 border border-gray-300 rounded-lg flex flex-col items-center">
                <button className="w-3/4 bg-blue-600 text-white font-semibold py-2 rounded mb-4 hover:bg-blue-700 transition">Download</button>
                <button className="w-3/4 border border-blue-600 text-blue-600 font-semibold py-2 rounded mb-4 hover:bg-blue-50 transition">Preview</button>
                <p className="text-xs text-gray-600 text-center mt-4 description">{theme.description}</p>
                <div className="mt-6 text-center text-gray-700">
                    <p className="font-semibold">Author</p>
                    <p>Discord: {theme.author.discord_name}</p>
                    {theme.author.github_name && <p>GitHub: {theme.author.github_name}</p>}
                </div>
            </div>
        </div>
    );
}
