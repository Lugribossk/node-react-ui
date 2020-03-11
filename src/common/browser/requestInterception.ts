import {Request} from "puppeteer-core";
import path from "path";
import fs from "fs";
import MIME_TYPES, {getMimeType} from "../util/mimeTypes";

// We can't use fs.promises.readFile() since that does not work with Pkg and Nexe's embedded resources.
const readFileAsync = async (path: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

export const serveLocalFile = async (rootFolder: string, relativeName: string, request: Request) => {
    const filename = path.join(rootFolder, decodeURIComponent(relativeName));
    if (!filename.startsWith(rootFolder)) {
        throw new Error(`Attempted to navigate outside root folder.`);
    }
    const extension = path.extname(relativeName).substr(1);

    console.log(`File request for ${filename}`);

    if (!fs.existsSync(filename)) {
        console.warn(`Local file not found: ${filename}`);
        return request.respond({
            status: 404,
            contentType: MIME_TYPES.json,
            body: JSON.stringify({message: `Local file not found: ${filename}`})
        });
    }

    const content = await readFileAsync(filename);
    return request.respond({
        status: 200,
        contentType: getMimeType(extension),
        headers: {
            // Needed for fonts sometimes?
            "Access-Control-Allow-Origin": "*",
            ...(extension === "csv" ? {"Content-Disposition": `attachment; filename="${path.basename(filename)}"`} : {})
        },
        body: content
    });
};
