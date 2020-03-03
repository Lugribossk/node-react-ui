import MIME_TYPES from "./mimeTypes";

type Request = import("puppeteer-core").Request;

export type Endpoints = {[name: string]: (...args: any[]) => Promise<any>};

export const createApiClient = <T extends Endpoints>(baseUrl: string): T => {
    return new Proxy(
        {},
        {
            get(target, name: string) {
                return async (...args: any[]) => {
                    const response = await fetch(`${baseUrl}/api/${name}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": MIME_TYPES.json
                        },
                        body: JSON.stringify({args: args})
                    });
                    if (!response.ok) {
                        let message;
                        try {
                            message = (await response.json()).message;
                        } catch (e) {
                            message = "Unknown";
                        }
                        throw new Error(`${name}() failed with error '${message}'`);
                    }
                    return response.json();
                };
            }
        }
    ) as T;
};

export const callApiMethod = async (server: Endpoints, request: Request) => {
    try {
        const url = new URL(request.url());
        const endpoint = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);

        const data = JSON.parse(request.postData() || "{}");
        const args = data.args || [];

        console.log(`Api request for ${endpoint}(${args})`);

        if (!(endpoint in server)) {
            return request.respond({
                status: 404,
                contentType: MIME_TYPES.json,
                body: JSON.stringify({message: `Endpoint ${endpoint} not found.`})
            });
        }

        const response = await server[endpoint](...args);
        return request.respond({
            status: 200,
            contentType: MIME_TYPES.json,
            body: JSON.stringify(response)
        });
    } catch (e) {
        return request.respond({
            status: 500,
            contentType: MIME_TYPES.json,
            body: JSON.stringify({message: e.message})
        });
    }
};
