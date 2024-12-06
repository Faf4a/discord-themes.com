const { PurgeCSS } = require("purgecss");
const { writeFileSync } = require("fs");

async function purge() {
    const purgeResult = await new PurgeCSS().purge({
        content: ["../public/preview/index.html"],
        css: ["../public/preview/styles.css"],
        safelist: {
            standard: [/^\:[-a-z]+$/]
        }
    });

    writeFileSync("./styles.css", purgeResult[0].css);
}

purge();
