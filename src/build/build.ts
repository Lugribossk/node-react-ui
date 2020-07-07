import fs from "fs";
import child_process from "child_process";
import path from "path";
import rimraf from "rimraf";
import Parcel from "@parcel/core";
import defaultParcelConfig from "@parcel/config-default";
import {compile} from "nexe";
import {exec} from "pkg";
import ncc from "@zeit/ncc";
import {NodePlatform} from "nexe/lib/target";

const runCommand = (cmd: string, args: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        const process = child_process.spawn(cmd, args);
        let output = "";

        process.stdout.on("data", data => {
            output += data.toString();
        });

        process.on("error", reject);
        process.on("close", code => {
            if (code === 0) {
                resolve(output);
            } else {
                console.error(output);
                reject(new Error("Command failed with exit code " + code));
            }
        });
    });
};

const nexeExecutable = async (appName: string, version: string, platform: NodePlatform) => {
    await compile({
        input: "target/main/main.js",
        output: `target/app/${appName}`,
        targets: [{
            platform: platform,
            arch: "x64",
            version: version
        }],
        resources: ["target/renderer/*"]
    });
};

const pkgExecutable = async (exeName: string, nodeVersion: string) => {
    await exec([
        "target/main/main.js",
        "--target",
        `node${nodeVersion}-win-x64`,
        "--output",
        `target/app/${exeName}.exe`,
        "--config",
        "package.json"
    ]);
};

const build = async () => {
    console.log("Building...");
    const appName = "app";
    const nodeVersion = "12.13.1";

    console.log("Cleaning target dir.");
    await new Promise(resolve => rimraf("target/main/**/*", resolve));
    await new Promise(resolve => rimraf("target/renderer/**/*", resolve));
    await new Promise(resolve => rimraf("target/app/**/*", resolve));

    console.log("Bundling renderer.");
    const bundler = new Parcel({
        entries: `src/renderer/index.html`,
        defaultConfig: {
            ...defaultParcelConfig,
            filePath: require.resolve("@parcel/config-default"),
        },
        disableCache: true,
        sourceMaps: false,
        mode: "production",
        distDir: "target/renderer"
    });
    await bundler.run();

    console.log("Bundling main.");
    let {code, assets} = await ncc(path.join(__dirname, `../main/main.ts`), {
        minify: true
    });
    // ncc turns require() calls for native modules into something like
    // require(__webpack_require__.ab + "/build/Release/ffi_bindings.node");
    // We replace this with a path relative to the executable which seems the most robust, and lets us place all of them in the same folder.
    code = code.replace(/require\([a-zA-Z0-9.+"/\\_\- ]+[/\\](\S+\.node)"\)/g, (match, name) => {
        return `require(require("path").dirname(process.execPath) + "/lib/${name}")`;
    });
    if (!fs.existsSync("target/main")) {
        await fs.promises.mkdir("target/main", {recursive: true});
    }
    await fs.promises.writeFile("target/main/main.js", code, "utf8");

    console.log("Copying native modules.");
    const libDir = "target/app/lib";
    if (!fs.existsSync(libDir)) {
        await fs.promises.mkdir(libDir, {recursive: true});
    }
    for (let [name, asset] of Object.entries(assets)) {
        await fs.promises.writeFile(`${libDir}/${path.basename(name)}`, asset.source);
    }

    console.log("Creating executables.");
    await nexeExecutable(appName, nodeVersion, "windows");
    await nexeExecutable(appName, nodeVersion, "mac");

    // Changing the subsytem of the executable makes it not show the console while running.
    const editBin =
        "C:/Program Files (x86)/Microsoft Visual Studio/2017/Community/VC/Tools/MSVC/14.16.27023/bin/Hostx64/x64/editbin.exe";
    if (fs.existsSync(editBin)) {
        console.log("Fixing executable subsystem.");
        await runCommand(editBin, ["/subsystem:windows", `target/app/${appName}.exe`]);
    }

    const upx = "target/upx.exe";
    if (fs.existsSync(upx)) {
        console.log("Compressing executable.");
        await runCommand(upx, [`target/app/${appName}.exe`]);
    }

    console.log("Done!");
    process.exit();
};

build().catch(e => {
    console.error(e);
    process.exit(-1);
});
