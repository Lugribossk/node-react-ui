import path from "path";
import fs from "fs";

type BrowserConstants = {
    exe: string;
    profileFolder: string;
    extensionFolder: string;
    reactDevToolsId: string;
};

const CHROME: BrowserConstants = {
    exe: path.join("Google", "Chrome", "Application", "chrome.exe"),
    profileFolder: "Chrome Profile",
    extensionFolder: path.join("Google", "Chrome"),
    reactDevToolsId: "fmkadmapgofadopljbjfkapdkoienihi"
};

const EDGE: BrowserConstants = {
    exe: path.join("Microsoft", "Edge", "Application", "msedge.exe"),
    profileFolder: "Edge Profile",
    extensionFolder: path.join("Microsoft", "Edge"),
    reactDevToolsId: "gpphkfbcpidddadnkolkpfckpihlkkil"
};

const findExe = (browserExe: string): string | undefined => {
    return [process.env["PROGRAMFILES(X86)"], process.env.PROGRAMFILES, process.env.LOCALAPPDATA]
        .filter(n => n !== undefined)
        .map(n => path.join(n!, browserExe))
        .find(n => {
            try {
                fs.accessSync(n);
                return true;
            } catch (e) {
                return false;
            }
        });
};

export const findChromium = (): Chromium | undefined => {
    let location = findExe(EDGE.exe);
    if (location) {
        return new Chromium(location, EDGE);
    }
    location = findExe(CHROME.exe);
    if (location) {
        return new Chromium(location, CHROME);
    }
    return undefined;
};

export default class Chromium {
    readonly path: string;
    private readonly constants: BrowserConstants;

    constructor(path: string, constants: BrowserConstants) {
        this.path = path;
        this.constants = constants;
    }

    getProfileFolder(userDataDir: string) {
        return path.join(userDataDir, this.constants.profileFolder);
    }

    findExtension(extensionId: string): string | undefined {
        const extensionFolder = path.join(
            process.env.LOCALAPPDATA!,
            this.constants.extensionFolder,
            "User Data",
            "Default",
            "Extensions",
            extensionId
        );
        if (!fs.existsSync(extensionFolder)) {
            return undefined;
        }

        // TODO find highest version
        return path.join(extensionFolder, fs.readdirSync(extensionFolder)[0]);
    }

    findReactDevTools(): string | undefined {
        return this.findExtension(this.constants.reactDevToolsId);
    }
}
