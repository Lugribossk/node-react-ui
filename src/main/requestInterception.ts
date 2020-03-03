import {Request} from "puppeteer-core";
import path from "path";
import fs from "fs";
import MIME_TYPES from "../shared/mimeTypes";

export const serveLocalFile = async (rootFolder: string, relativeName: string, request: Request) => {
    const filename = path.join(rootFolder, decodeURIComponent(relativeName));
    const extension = path.extname(relativeName);

    if (!fs.existsSync(filename)) {
        console.warn(`Local file not found: ${filename}`);
        return request.respond({
            status: 404,
            contentType: MIME_TYPES.json,
            body: JSON.stringify({message: `Local file not found: ${filename}`})
        });
    }

    const content = await fs.promises.readFile(filename);
    return request.respond({
        status: 200,
        contentType: MIME_TYPES[extension],
        body: content
    });
};
