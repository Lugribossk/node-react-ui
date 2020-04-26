import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

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
    url: string;
};

export const STUDY_DATA_FOLDER = path.join(process.env.ProgramData!, "iMotions", "Lab_NG", "Data");

export default class StudyService {
    private blah: string = "test";

    async getStudyNames(): Promise<string[]> {
        return fs
            .readdirSync(STUDY_DATA_FOLDER)
            .filter(file => path.extname(file) === ".db" && file !== "AttentionDB.db")
            .map(file => path.basename(file, ".db"));
    }

    async getStudyByName(name: string): Promise<Study> {
        const dbFile = path.join(STUDY_DATA_FOLDER, `${name}.db`);
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
                displayOrder: s.SlideShowPosition,
                path: s.StimuliPath,
                url: `/data/${name}/${s.StimuliPath}`
            }))
        };
    }
}
