import React, {useContext} from "react";
import {AllSync} from "./suspense/cache";
type DemoApiServer = import("../main/DemoService").default;

export const ApiContext = React.createContext<AllSync<DemoApiServer>>(undefined as any);

export const useApi = () => {
    return useContext(ApiContext);
};
