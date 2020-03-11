import Suspender from "./Suspender";

type Unpromisify<T> = T extends (...args: infer A) => Promise<infer U> ? (...args: A) => U : never;

export type AllSync<T> = {
    [K in keyof T]: Unpromisify<T[K]>;
};

export const createSuspenseCache = <T>(api: T): AllSync<T> => {
    const cache: Map<string, Suspender<any>> = new Map();
    return new Proxy(
        {},
        {
            get(target, name: PropertyKey) {
                if (typeof name === "symbol") {
                    return undefined;
                }
                return (...args: unknown[]) => {
                    const key = `${name};${args.map(a => `${a};`)}`;
                    if (!cache.has(key)) {
                        const promise = (api as any)[name](...args);
                        cache.set(key, new Suspender(promise));
                    }

                    const suspender = cache.get(key)!;
                    return suspender.valueOrThrow();
                };
            }
        }
    ) as AllSync<T>;
};
