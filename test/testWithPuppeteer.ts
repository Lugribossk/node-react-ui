import child_process from "child_process";
import path from "path";
import puppeteer, {Page} from "puppeteer-core";
import {sleep} from "../src/common/util/promiseUtils";

const startApp = async (path: string) => {
    const app = child_process.spawn(path, {
        env: {
            ...process.env,
            NODE_ENV: "test"
        },
        stdio: "inherit"
    });
    app.on("error", e => {
        throw e;
    });

    // TODO
    await sleep(3000);
    return app;
};

class TestContext {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async dispose() {
        await this.page.browser().close();
    }
}

export const start = async () => {
    const app = await startApp(path.join(__dirname, "../target/app/app.exe"));

    const browser = await puppeteer.connect({
        browserURL: "http://localhost:8315",
        defaultViewport: null
    });
    const page = (await browser.pages())[0];

    const h1 = await page.$eval("h1", e => e.innerHTML);
    console.log(h1);

    //return new TestContext(page);

    await browser.close();
};

start().catch(e => console.error(e));
