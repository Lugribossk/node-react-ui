import React from "react";
import {sendEventFunctionName} from "./Prompt";

export const Button: React.FunctionComponent<{event: string; children: string}> = ({event, children}) => {
    const script = `${sendEventFunctionName}('${event}')`;
    // React really doesn't like lowercase-c onclick, so we have to trick it in like this.
    const button = `<button class="btn" onclick="${script}">${children}</button>`;
    return <div style={{display: "inline-block"}} dangerouslySetInnerHTML={{__html: button}} />;
};
