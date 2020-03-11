import fs from "fs";
import path from "path";
import {openDatabase} from "./SqliteDb";

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
        const db = await openDatabase(dbFile);
        const study = await db.findFirst("select * from Study");
        const stimuli = await db.findAll("select * from Stimuli");

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
