import Suspender from "../suspense/Suspender";

type Listener = () => void;
type Unsubscriber = () => void;

/**
 * A Flux "store", a repository of data state that listens to actions and triggers events when changed.
 */
export default abstract class Store<T> {
    private listeners: Set<Listener>;
    private unsubscribers: Set<Unsubscriber>;
    private notify?: number;
    protected state!: Readonly<T>;

    protected constructor() {
        this.listeners = new Set();
        this.unsubscribers = new Set();
    }

    onChange(listener: Listener): Unsubscriber {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Synchronously change the stored state. Notify listeners on the next turn of the event loop.
     */
    protected setState(newState: Partial<T>) {
        this.state = {
            ...(this.state as any),
            ...(newState as any)
        };
        this.trigger();
    }

    protected subscribe(unsubscriber: Unsubscriber) {
        this.unsubscribers.add(unsubscriber);
    }

    protected track<P>(promise: Promise<P>) {
        promise.finally(() => this.trigger());
        return new Suspender(promise);
    }

    private trigger() {
        window.clearTimeout(this.notify);
        this.notify = window.setTimeout(() => {
            this.listeners.forEach(lst => lst());
        }, 0);
    }

    close() {
        this.unsubscribers.forEach(un => un());
        this.unsubscribers = new Set();
        this.listeners = new Set();
    }
}
