import {Endpoints} from "./requestInterceptionApi";

type DemoEndpoints = Endpoints & {
    getLength(text: string): Promise<{length: number}>;
};

export default DemoEndpoints;
