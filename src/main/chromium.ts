import path from "path";
import fs from "fs";

const CHROME_EXE = path.join("Google", "Chrome", "Application", "chrome.exe");
const EDGE_EXE = path.join("Microsoft", "Edge", "Application", "msedge.exe");

const REACT_DEVTOOLS_CHROME = "fmkadmapgofadopljbjfkapdkoienihi";
const REACT_DEVTOOLS_EDGE = "gpphkfbcpidddadnkolkpfckpihlkkil";

type Chromium = {
    path: string;
    type: "edge" | "chrome";
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
    let location = findExe(EDGE_EXE);
    if (location) {
        return {
            path: location,
            type: "edge"
        };
    }
    location = findExe(CHROME_EXE);
    if (location) {
        return {
            path: location,
            type: "chrome"
        };
    }
    return undefined;
};

const findExtension = (browser: string, extensionId: string): string | undefined => {
    const appData = process.env.LOCALAPPDATA;
    if (!appData) {
        return undefined;
    }
    const extensionFolder = path.join(appData, browser, "User Data", "Default", "Extensions", extensionId);
    if (!fs.existsSync(extensionFolder)) {
        return undefined;
    }

    // TODO find highest version
    return extensionFolder + "\\4.4.0_0";
};

export const findReactDevToolsArgs = (chromium: Chromium): string[] => {
    const path =
        chromium.type === "edge"
            ? findExtension("Microsoft\\Edge", REACT_DEVTOOLS_EDGE)
            : findExtension("Google\\Chrome", REACT_DEVTOOLS_CHROME);
    if (!path) {
        return [];
    }
    return [`--disable-extensions-except=${path}`, `--load-extension=${path}`];
};
