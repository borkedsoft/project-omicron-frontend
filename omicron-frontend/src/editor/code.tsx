import React from 'react';
import {
	getProject,
	csrftoken
} from '../utilities/project';

interface CodeProps {
	filename: string,
}

interface CodeState {
    code:        string,
    error:       string,
};

export default class CodeEditor extends React.Component<CodeProps, CodeState> {
	constructor(props: CodeProps) {
		super(props);

        this.updateCode = this.updateCode.bind(this);
		this.state = {
			code:        "",
			error:       "", // TODO: remove
		};

		console.log(this.props.filename);
        this.retrieveCode(this.props.filename);
	}

    componentDidUpdate(prevProps: CodeProps) {
        if (prevProps.filename !== this.props.filename) {
            console.log(this.props.filename);
            this.retrieveCode(this.props.filename);
        }
    }

    // TODO: split code retrieval/update/editing into another component
    retrieveCode(filename: string) {
        fetch(window.location + filename)
            .then((response) => response.text())
            .then((txt) => this.setState({ code: txt }));
    }

    updateCode(e: React.ChangeEvent<HTMLTextAreaElement>) {
        if (csrftoken === null) {
            console.log("Have no CSRF token!");
            return;
        }

        let newCode = e.target.value;

        this.setState({ code: newCode });

        let settings = {
            method: "PUT",
            body: JSON.stringify({ code: newCode }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken" : csrftoken,
            },
            // TODO: typescript has a value it expects for this,
            //       use that
            // TODO: hmm, does it really matter if we're running arbitrary
            //       javascript anyway, is there a way to sandbox 3rd-party
            //       code?
            //mode: "same-origin",
        };

        let self = this;

        // TODO: 3 fetchs for every keystroke is less than ideal, don't do that
        getProject()
            .then((proj) => {
                fetch(proj.codefiles)
                    .then((response) => response.json())
                    .then((objs) => {
                        for (var x in objs) {
                            if (objs[x].name === self.props.filename) {
                                return objs[x];
                            }
                        }

                        return {};
                    })
                    .then((obj) => {
                        fetch(obj.codetext, settings);
                    })
                    .catch((err: Error) => self.setState({ error: err.toString() }))
                    ;
            });
    };

	render() {
		return <>
			<div className="col">
			  <textarea placeholder='Loading...'
						style={{ margin: 0, width: "100%", height: "calc(100vh - 200px)" }}
						onChange={this.updateCode}
						value={this.state.code}
					>
			  </textarea>
			</div>
		</>
	}
}
