const MIME_TYPES = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    ttf: "font/ttf",
    eot: "application/vnd.ms-fontobject",
    json: "application/json",
    woff: "font/woff",
    woff2: "font/woff2",
    csv: "text/csv"
};

export default MIME_TYPES;

export const getMimeType = (extension: string) => {
    if (!(MIME_TYPES as any)[extension]) {
        console.warn(`Mime type not found for '${extension}'.`);
        return "text/plain";
    }
    return (MIME_TYPES as any)[extension];
};
