import path from "path";
import fs from "fs";
import child_process from "child_process";
import puppeteer, {Request} from "puppeteer-core";
import {findChromium, findReactDevToolsArgs} from "./chromium";
import {callApiMethod} from "../shared/requestInterceptionApi";
import MIME_TYPES from "../shared/mimeTypes";
import DemoApiServer from "./DemoApiServer";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const serveRendererFile = (pathname: string, request: Request) => {
    const filename = path.join(__dirname, "..", "..", "target", "renderer", pathname);
    const extension = path.extname(pathname);

    if (!fs.existsSync(filename)) {
        console.warn(`Renderer file not found: ${pathname}`);
        return request.respond({status: 404});
    }

    const content = fs.readFileSync(filename);
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
        args: [
            `--app=data:text/html,${encodeURIComponent("<title>Test</title>")}`,
            `--window-size=800,600`,
            `--window-position=500,500`,
            "--disable-windows10-custom-titlebar",
            ...(isDevelopment ? findReactDevToolsArgs(chromium) : []),
            ...(isTest ? ["--remote-debugging-port=8315"] : [])
        ]
    });
    const page = (await browser.pages())[0];

    const origin = "http://localhost:8080";
    const apiPrefix = "/api/";
    const server = new DemoApiServer();

    await page.setRequestInterception(true);
    page.on("request", async request => {
        const url = new URL(request.url());

        if (url.origin !== origin) {
            return request.continue();
        }

        if (url.pathname.startsWith(apiPrefix)) {
            return callApiMethod(server, request);
        }

        if (isDevelopment) {
            return request.continue();
        }

        return serveRendererFile(url.pathname, request);
    });

    await page.goto(`${origin}/index.html`);
};

run().catch(e => console.error(e));
