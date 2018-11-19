import fs, {readFileSync} from "fs";
import path from "path";
import EventEmitter from "events";
import puppeteer from "puppeteer-core";
import React from "react";
import ReactDOMServer from "react-dom/server";
import {Page} from "puppeteer-core";

// const css = readFileSync(__dirname + "/../../node_modules/purecss/build/pure-nr-min.css", "utf8");
const css = readFileSync(__dirname + "/../../node_modules/winstrap/dist/css/winstrap.min.css", "utf8");

const dataUri = (title: string, body: string) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;

    // return `data:text/html;base64,${Buffer.from(html).toString("base64")}`;

    return `data:text/html,${encodeURIComponent(html)}`;
};

const findChrome = () => {
    const suffix = `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`;
    const location = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"]]
        .filter(n => n !== undefined)
        .map(n => path.join(n!, suffix))
        .find(n => {
            try {
                fs.accessSync(n);
                return true;
            } catch (e) {
                return false;
            }
        });
    if (!location) {
        throw new Error("Chrome not found");
    }
    return location;
};


export const sendEventFunctionName = "sendEvent";

export const openPrompt = async (width = 600, height = 400) => {
    // To center, get resolution with:
    // wmic path win32_VideoController get CurrentHorizontalResolution, CurrentVerticalResolution
    // https://github.com/sebhildebrandt/systeminformation

    const browser = await puppeteer.launch({
        executablePath: findChrome(),
        headless: false,
        args: [`--app=data:text/html,`, `--window-size=${width},${height}`, `--window-position=500,500`]
    });
    const page = (await browser.pages())[0];

    const prompt = new Prompt(page);

    await page.exposeFunction(sendEventFunctionName, (name: string, data: any) => {
        console.log("Event:", name);
        prompt.emit(name, data);
    });

    return prompt;
};

export default class Prompt extends EventEmitter {
    readonly page: Page;
    title: string;

    constructor(page: Page) {
        super();
        this.page = page;
        this.title = "";
    }

    async render(element: React.ReactElement<any>) {
        const html = ReactDOMServer.renderToStaticMarkup(element);
        await this.page.goto(dataUri(this.title, html));
    }
}
