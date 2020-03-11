import React from "react";
import {Link, useParams} from "react-router-dom";
import {useStudyStore} from "./StudyStore";

const StudyDetails: React.FunctionComponent = () => {
    const {name} = useParams<{name: string}>();
    const study = useStudyStore().getStudy(name);

    return (
        <div className="container">
            <ol className="breadcrumb">
                <li>
                    <Link to="/">Studies</Link>
                </li>
                <li className="active">{name}</li>
            </ol>
            <h2>{name}</h2>
            <h3>Stimuli</h3>
            <ul>
                {study.stimuli.map(stimulus => (
                    <li key={stimulus.id}>
                        <h4>{stimulus.name}</h4>
                        <p>
                            {stimulus.type} - {stimulus.exposureTimeMs}ms
                        </p>
                        {stimulus.type === "image" && (
                            <img
                                style={{maxWidth: 100, maxHeight: 100}}
                                src={`http://localhost:8080/media/${study.name}/${stimulus.path}`}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default StudyDetails;
