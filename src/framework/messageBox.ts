import child_process from "child_process";

export const showMessageBox = (title: string, text: string) => {
    child_process.spawn("PowerShell", [
        "-Command",
        `(New-Object -ComObject Wscript.Shell).Popup("${text}", 0, "${title}", 16)`
    ]);
};
