import {openBrowserUi} from "./puppeteer";
import DemoService, {STUDY_DATA_FOLDER} from "./DemoService";

const run = async () => {
    await openBrowserUi({filesRoot: STUDY_DATA_FOLDER, services: [new DemoService()], initialRoute: "/"});
};

run().catch(e => console.error(e));
