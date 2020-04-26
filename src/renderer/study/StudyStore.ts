import Store from "../../common/flux/Store";
import {createStoreContext} from "../../common/flux/StoreContext";
import Suspender from "../../common/suspense/Suspender";
import {OnlyAsync} from "../../common/browser/rpcApi";
import type StudyService from "../../main/StudyService";
import type {Study} from "../../main/StudyService";

const [StudyStoreProvider, useStudyStore] = createStoreContext<StudyStore>();
export {StudyStoreProvider, useStudyStore};

type State = {
    studyNames: Suspender<string[]>;
    studies: {[name: string]: Suspender<Study>};
};

export default class StudyStore extends Store<State> {
    private api: OnlyAsync<StudyService>;

    constructor(api: OnlyAsync<StudyService>) {
        super();
        this.api = api;
        this.state = {
            studyNames: undefined as any,
            studies: {}
        };
    }

    getStudyNames(): string[] {
        if (!this.state.studyNames) {
            this.setState({studyNames: this.track(this.api.getStudyNames())});
        }
        return this.state.studyNames.valueOrThrow();
    }

    getStudy(name: string): Study {
        if (!this.state.studies[name]) {
            this.setState({
                studies: {
                    ...this.state.studies,
                    [name]: this.track(this.api.getStudyByName(name))
                }
            });
        }
        return this.state.studies[name].valueOrThrow();
    }
}
