import React, {ReactNode, Suspense, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

const ProgressRing = () => (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "90%"}}>
        <div className="progress-ring progress-medium">
            <div className="progress-circle"></div>
            <div className="progress-circle"></div>
            <div className="progress-circle"></div>
            <div className="progress-circle"></div>
            <div className="progress-circle"></div>
        </div>
    </div>
);

type Props = {
    delayMs?: number;
    fallback?: ReactNode;
};

const Placeholder: React.FunctionComponent<Props> = ({delayMs = 200, fallback = <ProgressRing />, children}) => {
    const [showFallback, setShowFallback] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setShowFallback(false);
        const timer = setTimeout(() => setShowFallback(true), delayMs);
        return () => clearTimeout(timer);
    }, [location]);

    return <Suspense fallback={showFallback ? fallback : null}>{children}</Suspense>;
};
export default Placeholder;
