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
                    return response.json();
                };
            }
        }
    ) as T;
};

export const callApiMethod = async (server: Endpoints, request: Request) => {
    const url = new URL(request.url());
    const endpoint = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);

    const data = JSON.parse(request.postData() || "{}");
    const args = data.args || [];

    console.log(`Api request for ${endpoint}(${args})`);

    if (!server[endpoint]) {
        return request.respond({status: 404});
    }

    const response = await server[endpoint](...args);
    return request.respond({
        status: 200,
        contentType: MIME_TYPES.json,
        body: JSON.stringify(response)
    });
};
