declare module "@zeit/ncc" {
    let temp: (path: string, options: any) => {code: string; map: any; assets: {[name: string]: {source: Buffer}}};
    export = temp;
}
