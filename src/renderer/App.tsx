import React, {StrictMode} from "react";
import {HashRouter, Switch, Route} from "react-router-dom";
import {createApiClient} from "../shared/rpcApi";
import Placeholder from "./suspense/Placeholder";
import StudyList from "./study/StudyList";
import StudyDetails from "./study/StudyDetails";
import {createSuspenseCache} from "./suspense/cache";
import {ApiContext} from "./ApiClient";
import ErrorBoundary from "./ui/ErrorBoundary";
type DemoApiServer = import("../main/DemoService").default;

const api = createApiClient<DemoApiServer>("http://localhost:8080");
const cache = createSuspenseCache(api);

const App = () => {
    return (
        <StrictMode>
            <HashRouter>
                <ErrorBoundary>
                    <Placeholder>
                        <ApiContext.Provider value={cache}>
                            <Switch>
                                <Route path="/studies/:name" component={StudyDetails} />
                                <Route path="/" component={StudyList} />
                            </Switch>
                        </ApiContext.Provider>
                    </Placeholder>
                </ErrorBoundary>
            </HashRouter>
        </StrictMode>
    );
};
export default App;
