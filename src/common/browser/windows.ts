import child_process from "child_process";
import {Library} from "ffi-napi";

const user32 = new Library("user32", {
    MessageBoxW: ["int32", ["int32", "string", "string", "int32"]]
});

const BUTTONS = {
    ok: 0,
    okCancel: 1,
    abortRetryIgnore: 2,
    yesNoCancel: 3,
    yesNo: 4,
    retryCancel: 5
};

const ICONS = {
    stop: 16,
    question: 32,
    exclamation: 48,
    info: 64
};

const text = (t: string) => Buffer.from(`${t}\0`, "ucs2");

export const showMessageBox = async (
    title: string,
    message: string,
    buttons: keyof typeof BUTTONS = "ok",
    icon: keyof typeof ICONS = "info"
) => {
    await user32.MessageBoxW(0, text(message), text(title), BUTTONS[buttons] + ICONS[icon]);
};

export const openExplorerFolder = (folder: string) => {
    child_process.spawn("explorer.exe", ["/select,", folder]);
};
