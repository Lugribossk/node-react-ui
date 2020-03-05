import path from "path";
import puppeteer from "puppeteer-core";
import {findChromium, findReactDevToolsArgs} from "./chromium";
import {API_PREFIX, callApiMethod, FILE_PREFIX} from "../shared/rpcApi";
import MIME_TYPES from "../shared/mimeTypes";
import {serveLocalFile} from "./requestInterception";
import {showMessageBox} from "./messageBox";
import StudyService, {STUDY_DATA_FOLDER} from "./StudyService";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

// The location of the renderer files.
// Must the the same as the Parcel build output folder and Pkg/Nexe resources folder.
const RENDERER_BUILT_FOLDER = path.join(__dirname, "..", "..", "target", "renderer");

// The "fake" url we will be servering the renderer files and RPC api on.
// Must be the same url as the Parcel dev server.
const SERVER_ORIGIN = "http://localhost:8080";

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

    const service = new StudyService();

    // Use Puppeteer's request interception feature to communicate with the UI.
    // This way it can make completely ordinary http requests, while responding directly to the requests in here
    // without having to run and secure a web server.
    await page.setRequestInterception(true);
    page.on("request", async request => {
        try {
            const url = new URL(request.url());

            // Real request so don't do anything to it.
            if (url.origin !== SERVER_ORIGIN) {
                return request.continue();
            }

            // RPC request for an api method, so call that on the service.
            if (url.pathname.startsWith(API_PREFIX)) {
                return callApiMethod([service], request);
            }

            // Request to display or "download" a file from the filesystem.
            if (url.pathname.startsWith(FILE_PREFIX)) {
                const filename = url.pathname.substr(url.pathname.indexOf(FILE_PREFIX) + FILE_PREFIX.length);
                return serveLocalFile(STUDY_DATA_FOLDER, filename, request);
            }

            // We're running in development mode, so send requests for renderer files onwards to the Parcel dev server.
            if (isDevelopment) {
                return request.continue();
            }

            // We're running in production so serve renderer files from the filesystem (which will actually hit the
            // resources in the virtual filesystem packaged with Pkg/Nexe rather than the real one).
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

    await page.goto(`${SERVER_ORIGIN}/index.html`);
};

run().catch(e => console.error(e));
