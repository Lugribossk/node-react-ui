import MIME_TYPES from "../util/mimeTypes";
import type {Request} from "puppeteer-core";

// type AsyncFunctionNames<T> = {
//     [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer U> ? K : never;
// }[keyof T];
//
// type AsyncFunctions<T> = Pick<T, AsyncFunctionNames<T>>;

type AsyncMethod<T> = T extends (...args: infer A) => Promise<infer U> ? T : never;

export type OnlyAsync<T> = {
    [K in keyof T]: AsyncMethod<T[K]>;
};

export type RpcService = {};

export const API_PREFIX = "/api/";
export const FILE_PREFIX = "/files/";

export const createApiClient = <T>(): OnlyAsync<T> => {
    // Create a proxy where any property access returns a function that will send an http request to an RPC endpoint with the same name.
    // This would be pure chaos in js as all method names would be callable regardless of whether that makes sense.
    // Fortunately we're using Typescript and can cast the proxy to the same type as the Node class that implements the RPC service.
    // That way only the methods that we know exist are callable and their parameters have the right types.
    return new Proxy(
        {},
        {
            get(target, name: PropertyKey) {
                if (typeof name === "symbol") {
                    return undefined;
                }
                return async (...args: any[]) => {
                    const response = await fetch(`${API_PREFIX}${name}`, {
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
    ) as OnlyAsync<T>;
};

export const callApiMethod = async (services: RpcService[], request: Request) => {
    try {
        const url = new URL(request.url());
        const endpoint = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);

        const data = JSON.parse(request.postData() || "{}");
        const args = data.args || [];

        console.log(`Api request for ${endpoint}(${JSON.stringify(args).slice(1, -1)})`);

        const service = services.find(s => endpoint in s);
        if (!service) {
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
