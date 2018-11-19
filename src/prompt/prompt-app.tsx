import React from "react";
import {Button} from "./components";
import {openPrompt} from "./Prompt";

const run = async () => {
    const prompt = await openPrompt();
    prompt.title = "Test?";

    prompt.on("test", () => {
        prompt.render(
            <div className="container">
                <h1>Done!</h1>
                <Button event="test2">Close</Button>
            </div>
        );
    });

    prompt.on("test2", () => {
        prompt.page.close();
    });

    await prompt.render(
        <div className="container">
            <h1>Do stuff?</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="blah1">Label1</label>
                    <input type="text" id="blah1" className="form-control" />
                </div>
            </form>
            <Button event="test">Do stuff</Button>
        </div>
    );
};

run().catch(e => console.error(e));
