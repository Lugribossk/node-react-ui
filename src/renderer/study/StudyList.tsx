import React from "react";
import {useApi} from "../ApiClient";
import {Link} from "react-router-dom";

const StudyList: React.FunctionComponent = () => {
    const names = useApi().getStudyNames();

    return (
        <div className="container">
            <ol className="breadcrumb">
                <li className="active">Studies</li>
            </ol>
            <h2>Studies</h2>
            <ul>
                {names.map(name => (
                    <li key={name}>
                        <Link to={`/studies/${name}`}>{name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default StudyList;
