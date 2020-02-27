import React, {useState} from "react";
import {createApiClient} from "../shared/requestInterceptionApi";
import DemoEndpoints from "../shared/DemoEndpoints";

const api = createApiClient<DemoEndpoints>("http://localhost:8080");

export default function App() {
    const [text, setText] = useState("");
    const [length, setLength] = useState<number | undefined>(undefined);

    return (
        <div className="container">
            <h1>Do stuff?</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="blah1">Label1</label>
                    <input
                        type="text"
                        id="blah1"
                        className="form-control"
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                </div>
            </form>
            <button
                className="btn"
                onClick={async () => {
                    const data = await api.getLength(text);
                    setLength(data.length);
                }}
            >
                Do stuff
            </button>
            {length !== undefined && <p>Response: {length}</p>}
        </div>
    );
}
