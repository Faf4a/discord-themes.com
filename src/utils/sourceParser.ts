import fetch from "node-fetch";

interface ParsedSourceUrl {
    owner: string;
    repo: string;
    branch: string;
    path: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function parseSourceUrl(url: string): Promise<string> {
    if (isRawUrl(url)) {
      const result = await fetchRawContent(url);
      const rawContent = Buffer.from(result, "utf-8").toString("base64");
      return rawContent;
    }

    const parsed = parseUrl(url);
    if (!parsed) throw new Error("Invalid GitHub URL");

    return fetchApiContent(parsed);
}

function isRawUrl(url: string): boolean {
    return url.includes("raw.githubusercontent.com");
}

function parseUrl(url: string): ParsedSourceUrl | null {
    // eslint-disable-next-line no-useless-escape
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

async function fetchApiContent(parsed: ParsedSourceUrl): Promise<string | null> {
    const { owner, repo, branch, path } = parsed;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const headers = GITHUB_TOKEN
        ? {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${GITHUB_TOKEN}`
          }
        : {};

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return null;

        const data: any = await response.json();
        if (!data.content) return null;

        return data.content;
    } catch {
        return null;
    }
}
