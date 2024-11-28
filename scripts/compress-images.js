const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const imagesDir = path.join(__dirname, "../public/thumbnails");

fs.readdir(imagesDir, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(imagesDir, file);
        const fileExt = path.extname(file).toLowerCase();

        if (fileExt === ".jpg" || fileExt === ".jpeg" || fileExt === ".png" || fileExt === ".gif") {
            const outputFilePath = path.join(imagesDir, "compressed", file);

            fs.mkdir(path.join(imagesDir, "compressed"), { recursive: true }, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const command = `ffmpeg -i "${filePath}" -q:v 1 "${outputFilePath}"`;
                exec(command, (err, stdout, stderr) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log(`Compressed ${file} successfully.`);
                });
            });
        }
    });
});
