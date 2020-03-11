import React, {StrictMode, useState} from "react";
import {HashRouter, Switch, Route} from "react-router-dom";
import Placeholder from "../common/suspense/Placeholder";
import StudyList from "./study/StudyList";
import StudyDetails from "./study/StudyDetails";
import ErrorBoundary from "../common/ui/ErrorBoundary";
import StudyStore, {StudyStoreProvider} from "./study/StudyStore";
import {createApiClient} from "../common/browser/rpcApi";
type StudyService = import("../main/StudyService").default;

const App = () => {
    const [api] = useState(() => createApiClient<StudyService>());
    const [studyStore] = useState(() => new StudyStore(api));

    return (
        <StrictMode>
            <HashRouter>
                <ErrorBoundary>
                    <Placeholder>
                        <StudyStoreProvider value={studyStore}>
                            <Switch>
                                <Route path="/studies/:name" component={StudyDetails} />
                                <Route path="/" component={StudyList} />
                            </Switch>
                        </StudyStoreProvider>
                    </Placeholder>
                </ErrorBoundary>
            </HashRouter>
        </StrictMode>
    );
};
export default App;
