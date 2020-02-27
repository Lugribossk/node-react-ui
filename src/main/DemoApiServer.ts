import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import DemoEndpoints from "../shared/DemoEndpoints";

const dataPath = path.join(process.env.ProgramData!, "iMotions", "Lab_NG", "Data");

export default class DemoApiServer implements DemoEndpoints {
    [name: string]: (...args: any[]) => Promise<any>;

    async getStudyNames() {
        return fs.readdirSync(dataPath).filter(file => fs.statSync(path.join(dataPath, file)).isDirectory());
    }

    async getStudyByName(name: string) {
        const dbFile = path.join(dataPath, `${name}.db`);
        const db = new Database(dbFile, {fileMustExist: true});
        const study = db.prepare("select * from Study").get();
        const stimuli = db.prepare("select * from Stimuli").all();

        return {
            id: study.UniqueStudyIdentifier,
            name: name,
            stimuli: stimuli.map(s => ({
                id: s.Id,
                name: s.StimuliDisplayName,
                type: s.StimuliType.toLowerCase(),
                exposureTimeMs: s.StimuliExposureTime * 1000,
                displayOrder: s.SlideShowPosition
            }))
        };
    }
}
