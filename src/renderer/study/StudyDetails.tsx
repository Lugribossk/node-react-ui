import React from "react";
import {Link, useParams} from "react-router-dom";
import {useApi} from "../ApiClient";

const StudyDetails: React.FunctionComponent = () => {
    const {name} = useParams();
    const study = useApi().getStudyByName(name!);

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
                        {stimulus.name} - {stimulus.type} - {stimulus.exposureTimeMs}ms
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default StudyDetails;
