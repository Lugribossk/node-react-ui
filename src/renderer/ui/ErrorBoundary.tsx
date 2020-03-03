import React from "react";

type State = {
    error: Error | undefined;
};

export default class ErrorBoundary extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            error: undefined
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            error: error
        };
    }

    render() {
        if (!this.state.error) {
            return this.props.children;
        }
        return (
            <div className="alert-stack">
                <div className="alert alert-danger">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-24">
                                <p>Error: {this.state.error?.message || "Unknown"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
