import path from "path";
import child_process from "child_process";
import puppeteer from "puppeteer-core";
import {findChromium, findReactDevToolsArgs} from "./chromium";
import {callApiMethod} from "../shared/rpcApi";
import MIME_TYPES from "../shared/mimeTypes";
import DemoService, {STUDY_DATA_FOLDER} from "./DemoService";
import {serveLocalFile} from "./requestInterception";
import {showMessageBox} from "./messageBox";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const RENDERER_BUILT_FOLDER = path.join(__dirname, "..", "..", "target", "renderer");

const run = async () => {
    // To center, get resolution with:
    // wmic path win32_VideoController get CurrentHorizontalResolution, CurrentVerticalResolution
    // https://github.com/sebhildebrandt/systeminformation

    const chromium = findChromium();
    if (!chromium) {
        showMessageBox(
            "Edge or Chrome required",
            "Please install the latest version of either Microsoft Edge or Google Chrome."
        );
        throw new Error("Browser not found.");
    }

    const browser = await puppeteer.launch({
        executablePath: chromium.path,
        headless: false,
        pipe: true,
        defaultViewport: null,
        args: [
            `--app=data:text/html,${encodeURIComponent("<title>Loading...</title>")}`,
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
    const service = new DemoService();

    await page.setRequestInterception(true);
    page.on("request", async request => {
        try {
            const url = new URL(request.url());

            if (url.origin !== origin) {
                return request.continue();
            }

            if (url.pathname.startsWith(apiPrefix)) {
                return callApiMethod(service, request);
            }

            if (url.pathname.startsWith(mediaPrefix)) {
                const filename = url.pathname.substr(url.pathname.indexOf(mediaPrefix) + mediaPrefix.length);
                return serveLocalFile(STUDY_DATA_FOLDER, filename, request);
            }

            if (isDevelopment) {
                return request.continue();
            }

            return serveLocalFile(RENDERER_BUILT_FOLDER, url.pathname, request);
        } catch (e) {
            console.error("Error while handing request:", e);
            return request.respond({
                status: 500,
                contentType: MIME_TYPES.json,
                body: JSON.stringify({message: e.message})
            });
        }
    });

    await page.goto(`${origin}/index.html`);
};

run().catch(e => console.error(e));
