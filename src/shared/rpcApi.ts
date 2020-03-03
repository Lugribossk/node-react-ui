import MIME_TYPES from "./mimeTypes";
type Request = import("puppeteer-core").Request;

// type AsyncFunctionNames<T> = {
//     [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer U> ? K : never;
// }[keyof T];
//
// type AsyncFunctions<T> = Pick<T, AsyncFunctionNames<T>>;

type AsyncMethod<T> = T extends (...args: infer A) => Promise<infer U> ? T : never;

type AllAsync<T> = {
    [K in keyof T]: AsyncMethod<T[K]>;
};

export const createApiClient = <T>(baseUrl: string): AllAsync<T> => {
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
    ) as AllAsync<T>;
};

export const callApiMethod = async (service: {}, request: Request) => {
    try {
        const url = new URL(request.url());
        const endpoint = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);

        const data = JSON.parse(request.postData() || "{}");
        const args = data.args || [];

        console.log(`Api request for ${endpoint}(${args})`);

        if (!(endpoint in service)) {
            return request.respond({
                status: 400,
                contentType: MIME_TYPES.json,
                body: JSON.stringify({message: `Endpoint ${endpoint} does not exist.`})
            });
        }

        const response = await (service as any)[endpoint](...args);
        return request.respond({
            status: 200,
            contentType: MIME_TYPES.json,
            body: JSON.stringify(response)
        });
    } catch (e) {
        console.error("Error with api request:", e);
        return request.respond({
            status: 500,
            contentType: MIME_TYPES.json,
            body: JSON.stringify({message: e.message})
        });
    }
};
