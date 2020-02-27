import {Endpoints} from "../../shared/requestInterceptionApi";

type Unpromisify<T> = T extends Promise<infer U> ? U : T;

export type SuspenseCache<T extends Endpoints> = {
    [P in keyof T]: T[P] extends (...args: infer R) => any ? (...args: R) => Unpromisify<ReturnType<T[P]>> : never;
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

    valueorThrow(): T {
        if (this.state === "pending") {
            throw this.promise;
        }
        if (this.state === "rejected") {
            throw this.value;
        }
        return this.value as any;
    }
}

export const createSuspenseCache = <T extends Endpoints>(api: T): SuspenseCache<T> => {
    const cache: Map<string, Suspender<any>> = new Map();
    return new Proxy(
        {},
        {
            get(target, name: string) {
                return (...args: unknown[]) => {
                    const key = `${name};${args.map(a => `${a};`)}`;
                    if (!cache.has(key)) {
                        const promise = api[name](...args);

                        cache.set(key, new Suspender(promise));
                    }

                    const suspender = cache.get(key)!;
                    return suspender.valueorThrow();
                };
            }
        }
    ) as SuspenseCache<T>;
};
