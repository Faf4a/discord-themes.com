const { mkdir, readdir } = require("fs");
const { join, extname } = require("path");
const { exec } = require("child_process");

const images = path.join(__dirname, "../public/thumbnails");

readdir(images, (err, files) => {
    if (err) return console.error(err);

    files.forEach((file) => {
        const path = join(images, file);
        const ext = extname(file).toLowerCase();

        if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif") {
            const outputFilePath = join(images, "tmp", file);

            mkdir(join(images, "tmp"), { recursive: true }, (err) => {
                if (err) return console.error(err);

                const c = `ffmpeg -i "${path}" -q:v 1 "${outputFilePath}"`;
                exec(c, (err, stdout, stderr) => {
                    if (err) return console.error(err);
                    console.log(`Compressed: ${file}`);
                });
            });
        }
    });
});
