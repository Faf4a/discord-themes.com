import fetch from "node-fetch";

interface ParsedSourceUrl {
    owner: string;
    repo: string;
    branch: string;
    path: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function parseSourceUrl(url: string): Promise<string> {
    if (isRawUrl(url)) return fetchRawContent(url);

    const parsed = parseUrl(url);
    if (!parsed) throw new Error("Invalid GitHub URL");

    return fetchApiContent(parsed);
}

function isRawUrl(url: string): boolean {
    return url.includes("raw.githubusercontent.com");
}

function parseUrl(url: string): ParsedSourceUrl | null {
    const pattern = /github\.com\/([^\/]+)\/([^\/]+)\/(?:blob|tree)\/([^\/]+)\/(.+)/;
    const match = url.match(pattern);

    if (match) {
        const [, owner, repo, branch, path] = match;
        return { owner, repo, branch, path };
    }
    return null;
}

async function fetchRawContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
    return response.text();
}

async function fetchApiContent(parsed: ParsedSourceUrl): Promise<string> {
    const { owner, repo, branch, path } = parsed;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    console.log(url);
    const headers = GITHUB_TOKEN
        ? {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${GITHUB_TOKEN}`
          }
        : {};

    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    const content = await response.json();
    console.log(content);
    return response.text();
}
