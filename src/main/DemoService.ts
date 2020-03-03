import fs from "fs";
import path from "path";
import {Database, OPEN_READWRITE} from "sqlite3";

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

export type Study = {
    id: string;
    name: string;
    stimuli: Stimulus[];
};

export type Stimulus = {
    id: string;
    name: string;
    type: "image" | "video";
    exposureTimeMs: number;
    displayOrder: number;
    path: string;
};

export const STUDY_DATA_FOLDER = path.join(process.env.ProgramData!, "iMotions", "Lab_NG", "Data");

export default class DemoService {
    private blah: string = "test";

    async getStudyNames(): Promise<string[]> {
        return fs
            .readdirSync(STUDY_DATA_FOLDER)
            .filter(file => path.extname(file) === ".db" && file !== "AttentionDB.db")
            .map(file => path.basename(file, ".db"));
    }

    async getStudyByName(name: string): Promise<Study> {
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
