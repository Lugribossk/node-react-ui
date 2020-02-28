import path from "path";
import fs from "fs";
import child_process from "child_process";
import puppeteer, {Request} from "puppeteer-core";
import {findChromium, findReactDevToolsArgs} from "./chromium";
import {callApiMethod} from "../shared/requestInterceptionApi";
import MIME_TYPES from "../shared/mimeTypes";
import DemoApiServer, {STUDY_DATA_FOLDER} from "./DemoApiServer";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const serveLocalFile = async (rootFolder: string, relativeName: string, request: Request) => {
    const filename = path.join(rootFolder, decodeURIComponent(relativeName));
    const extension = path.extname(relativeName);

    if (!fs.existsSync(filename)) {
        console.warn(`Local file not found: ${filename}`);
        return request.respond({status: 404});
    }

    const content = await fs.promises.readFile(filename);
    return request.respond({
        status: 200,
        contentType: MIME_TYPES[extension],
        body: content
    });
};

const run = async () => {
    // To center, get resolution with:
    // wmic path win32_VideoController get CurrentHorizontalResolution, CurrentVerticalResolution
    // https://github.com/sebhildebrandt/systeminformation

    const chromium = findChromium();
    if (!chromium) {
        child_process.spawn("PowerShell", [
            "-Command",
            `(New-Object -ComObject Wscript.Shell).Popup("Please install the latest version of either Microsoft Edge or Google Chrome.", 0, "Edge or Chrome required", 16)`
        ]);
        throw new Error("Browser not found.");
    }

    const browser = await puppeteer.launch({
        executablePath: chromium.path,
        headless: false,
        pipe: true,
        defaultViewport: null,
        args: [
            `--app=data:text/html,${encodeURIComponent("<title>Test</title>")}`,
            `--window-size=1000,800`,
            `--window-position=500,300`,
            "--disable-windows10-custom-titlebar",
            ...(isDevelopment ? findReactDevToolsArgs(chromium) : []),
            ...(isTest ? ["--remote-debugging-port=8315"] : [])
        ]
    });
    const page = (await browser.pages())[0];

    const origin = "http://localhost:8080";
    const apiPrefix = "/api/";
    const mediaPrefix = "/media/";
    const rendererFiles = path.join(__dirname, "..", "..", "target", "renderer");
    const server = new DemoApiServer();

    await page.setRequestInterception(true);
    page.on("request", async request => {
        try {
            const url = new URL(request.url());

            if (url.origin !== origin) {
                return request.continue();
            }

            if (url.pathname.startsWith(apiPrefix)) {
                return callApiMethod(server, request);
            }

            if (url.pathname.startsWith(mediaPrefix)) {
                const filename = url.pathname.substr(url.pathname.indexOf(mediaPrefix) + mediaPrefix.length);
                return serveLocalFile(STUDY_DATA_FOLDER, filename, request);
            }

            if (isDevelopment) {
                return request.continue();
            }

            return serveLocalFile(rendererFiles, url.pathname, request);
        } catch (e) {
            console.error("Error while handing request:", e);
            return request.respond({status: 503});
        }
    });

    await page.goto(`${origin}/index.html`);
};

run().catch(e => console.error(e));
