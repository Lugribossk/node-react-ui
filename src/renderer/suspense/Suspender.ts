export default class Suspender<T> {
    readonly promise: Promise<T>;
    private state: "pending" | "resolved" | "rejected";
    private value: undefined | T | Error;

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
