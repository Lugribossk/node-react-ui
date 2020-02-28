import fs from "fs";
import path from "path";
import {Database, OPEN_READWRITE} from "sqlite3";
import DemoEndpoints from "../shared/DemoEndpoints";

const dbGet = (db: Database, sql: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

const dbAll = (db: Database, sql: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

export const STUDY_DATA_FOLDER = path.join(process.env.ProgramData!, "iMotions", "Lab_NG", "Data");

export default class DemoApiServer implements DemoEndpoints {
    [name: string]: (...args: any[]) => Promise<any>;

    async getStudyNames() {
        return fs
            .readdirSync(STUDY_DATA_FOLDER)
            .filter(file => path.extname(file) === ".db" && file !== "AttentionDB.db")
            .map(file => path.basename(file, ".db"));
    }

    async getStudyByName(name: string) {
        const dbFile = path.join(STUDY_DATA_FOLDER, `${name}.db`);
        const db = new Database(dbFile, OPEN_READWRITE);
        const study = await dbGet(db, "select * from Study");
        const stimuli = await dbAll(db, "select * from Stimuli");

        return {
            id: study.UniqueStudyIdentifier,
            name: name,
            stimuli: stimuli.map(s => ({
                id: s.Id,
                name: s.StimuliDisplayName,
                type: s.StimuliType.toLowerCase(),
                exposureTimeMs: s.StimuliExposureTime * 1000,
                displayOrder: s.SlideShowPosition,
                path: s.StimuliPath
            }))
        };
    }
}
