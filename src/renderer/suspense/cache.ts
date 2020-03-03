type Unpromisify<T> = T extends (...args: infer A) => Promise<infer U> ? (...args: A) => U : never;

export type AllSync<T> = {
    [K in keyof T]: Unpromisify<T[K]>;
};

class Suspender<T> {
    readonly promise: Promise<T>;
    state: "pending" | "resolved" | "rejected";
    value: undefined | T | Error;

    constructor(promise: Promise<T>) {
        this.promise = promise;
        this.state = "pending";
        this.value = undefined;

        promise.then(
            value => {
                this.state = "resolved";
                this.value = value;
            },
            e => {
                this.state = "rejected";
                this.value = e;
            }
        );
    }

    valueOrThrow(): T {
        if (this.state === "pending") {
            throw this.promise;
        }
        if (this.state === "rejected") {
            throw this.value;
        }
        return this.value as T;
    }
}

export const createSuspenseCache = <T>(api: T): AllSync<T> => {
    const cache: Map<string, Suspender<any>> = new Map();
    return new Proxy(
        {},
        {
            get(target, name: string) {
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
