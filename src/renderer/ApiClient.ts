import DemoEndpoints from "../shared/DemoEndpoints";
import React, {useContext} from "react";
import {SuspenseCache} from "./suspense/cache";

export const ApiContext = React.createContext<SuspenseCache<DemoEndpoints>>(undefined as any);

export const useApi = () => {
    return useContext(ApiContext);
};
