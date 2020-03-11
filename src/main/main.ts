import path from "path";
import {openBrowserUi} from "../common/browser/puppeteer";
import StudyService, {STUDY_DATA_FOLDER} from "./StudyService";

const run = async () => {
    await openBrowserUi({
        filesRoot: STUDY_DATA_FOLDER,
        rendererRoot: path.join(__dirname, "..", "..", "target", "renderer"),
        services: [new StudyService()],
        userDataDir: path.join(process.env.ProgramData!, "node-react-ui", "Test")
    });
};

run().catch(e => console.error(e));
