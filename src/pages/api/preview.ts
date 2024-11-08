import { readFileSync } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed", wants: "GET" });
    }

    const { url } = req.query;
    const filePath = join(process.cwd(), "public", "preview", "index.html");
    let htmlContent = readFileSync(filePath, "utf8");

    const lightModeTags = "has-webkit-scrollbar full-motion desaturate-user-colors show-redesigned-icons theme-light images-light density-compact platform-web font-size-16";
    const darkModeTags = "has-webkit-scrollbar full-motion desaturate-user-colors show-redesigned-icons theme-dark images-dark density-compact platform-web font-size-16";

    const toolbarHTML = `
            <div id="theme-toolbar" class="theme-toolbar dark">
                <div class="toolbar-content">
                    <button id="theme-toggle" class="theme-toggle">Light Mode</button>
                    <span class="theme-help">
                        Nothing changing? The theme might not support both modes!
                    </span>
                </div>
                <div class="toolbar-footer">
                    <span class="theme-disclaimer">
                        discord-themes(.com) is not affiliated or endorsed by Discord Inc.
                    </span>
                </div>
            </div>
        
            <style>
                .theme-toolbar {
                    position: fixed;
                    bottom: 82px;
                    right: 0;
                    padding: 8px;
                    border-radius: 4px 0 0 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: -2px 2px 8px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    background: rgba(0,0,0,0.85);
                    color: white;
                    pointer-events: none;
                }
        
                .theme-toolbar.dark {
                    background: rgba(0,0,0,0.85);
                    color: white;
                }
        
                .theme-toolbar.light {
                    background: rgba(255,255,255,0.95);
                    color: black;
                }
        
                .toolbar-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
    
                .toolbar-footer {
                    margin-top: 4px;
                    margin-bottom: 2px;
                }
    
                .theme-help {
                    font-size: 11px;
                    opacity: 0.9;
                    line-height: 1.2;
                    max-width: 240px;
                }
        
                .theme-toggle {
                    cursor: pointer;
                    pointer-events: auto;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    white-space: nowrap;
                }
        
                .theme-toggle.dark {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                }
        
                .theme-toggle.light {
                    background: rgba(0,0,0,0.1);
                    border: 1px solid rgba(0,0,0,0.2);
                    color: black;
                }
        
                .theme-toggle:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
        
                .theme-toggle.dark:hover {
                    background: rgba(255,255,255,0.2);
                }
        
                .theme-toggle.light:hover {
                    background: rgba(0,0,0,0.2);
                }
        
                .theme-disclaimer {
                    font-size: 6px;
                    opacity: 0.7;
                    line-height: 1;
                    text-align: center;
                    display: block;
                }
            </style>
        
            <script type="module">
                const toolbar = document.getElementById('theme-toolbar');
                const toggle = document.getElementById('theme-toggle');
                let isLightMode = false;
        
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isLightMode = !isLightMode;
                    document.documentElement.classList = isLightMode ? '${lightModeTags}' : '${darkModeTags}';
                    
                    toolbar.className = 'theme-toolbar ' + (isLightMode ? 'light' : 'dark');
                    toggle.className = 'theme-toggle ' + (isLightMode ? 'light' : 'dark');
                    toggle.textContent = isLightMode ? 'Dark Mode' : 'Light Mode';
                });
            </script>
        `;

    if (url) {
        const linkTag = `<link rel="stylesheet" type="text/css" href="${url}">`;
        htmlContent = htmlContent.replace("<!--injectSpace-->", linkTag);
    }

    htmlContent = htmlContent.replace("</body>", `${toolbarHTML}</body>`);

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlContent);
}
