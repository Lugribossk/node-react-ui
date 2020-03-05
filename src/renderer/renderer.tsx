import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

if (process.env.NODE_ENV === "production") {
    document.addEventListener("contextmenu", event => event.preventDefault());
}

ReactDOM.render(<App />, document.getElementById("root"));
