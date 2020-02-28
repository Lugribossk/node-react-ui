import {Endpoints} from "./requestInterceptionApi";

export type Study = {
    id: string;
    name: string;
    stimuli: Stimulus[];
};

type Stimulus = {
    id: string;
    name: string;
    type: "image" | "video";
    exposureTimeMs: number;
    displayOrder: number;
    path: string;
};

type DemoEndpoints = Endpoints & {
    getStudyNames(): Promise<string[]>;
    getStudyByName(name: string): Promise<Study>;
};

export default DemoEndpoints;
