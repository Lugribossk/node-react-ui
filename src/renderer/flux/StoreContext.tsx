import {createContext, useContext, useEffect, useState, Provider} from "react";
import Store from "./Store";

/**
 * Create a React context and hook that accesses that context for a specific type of store.
 */
export const createStoreContext = <T extends Store<unknown>>(): [Provider<T>, () => T] => {
    const context = createContext<T>(undefined as any);

    const useStoreContext = () => {
        const [update, setUpdate] = useState(0);
        const store = useContext(context);

        useEffect(() => {
            return store.onChange(() => setUpdate(n => n + 1));
        }, [store]);
        //useDebugValue(store.constructor.name);

        return store;
    };

    return [context.Provider, useStoreContext];
};
