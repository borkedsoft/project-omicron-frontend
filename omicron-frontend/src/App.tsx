import React from 'react';
import logo from './logo.svg';
import './App.css';

// grab the projectID variable declared externally
const projectID  = (window as any).projectID  as number;
const projectURL = (window as any).projectURL as string;


// https://docs.djangoproject.com/en/4.0/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
function getCookie(name: string) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// TODO: should probably store, pass canvas context in as a parameter
const initialCode =
`var canvas = document.getElementById("gameCanvas");

if (canvas.getContext) {
    var ctx = canvas.getContext("2d");

    var t = elapsed/1000;
    var nsin = 0.5 + 0.5*Math.sin(t);
    var ncos = 0.5 + 0.5*Math.cos(t);
    var x = (canvas.width  - 150)*(nsin);
    var y = (canvas.height - 150)*(ncos);

    var r = 64+Math.floor(191*nsin);
    var g = 64+Math.floor(191*ncos);
    var b = 127;

    ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(25 + x, 25 + y, 100, 100);
}`;

type Properties = {
    [name: string]: any
};

interface AppState {
    currentFile:    string,
    availableFiles: string[],
    code:           string,
    evaled:         (elapsed: number) => void,
    running:        boolean,
    start:          number,
    error:          string | null,
};

export default class App extends React.Component<{}, AppState> {
    constructor(props: Properties) {
        super(props);

        this.updateCode     = this.updateCode.bind(this);
        this.startAnim      = this.startAnim.bind(this);
        this.stopAnim       = this.stopAnim.bind(this);
        this.setCurrentFile = this.setCurrentFile.bind(this);

        this.state = {
            currentFile:    "main.js",
            availableFiles: [],
            code:           "",
            evaled:         function (elapsed: number) {},
            running:        false,
            start:          -1,
            error:          null,
        };

        // TODO: load main.js
        //this.loadCode(initialCode);
        this.retrieveCode(this.state.currentFile);
        this.updateProject();
    }

    // TODO: split code retrieval/update/editing into another component
    retrieveCode(filename: string) {
        fetch(window.location + filename)
            .then((response) => response.text())
            .then((txt) => this.setState({ code: txt }));
    }

    getProject() {
        return fetch(projectURL)
            .then((response) => response.json());
    }

    setCurrentFile(filename: string) {
        this.setState({ currentFile: filename });
        this.retrieveCode(filename);
    }

	updateProject() {
        let self = this;

		this.getProject()
            .then((proj) => {
                fetch(proj.codefiles)
                    .then((response) => response.json())
                    .then((objs) => {
                        var ret: string[] = [];

                        for (var x in objs) {
                            ret.push(objs[x].name);
                        }

                        self.setState({ availableFiles: ret });
                        //console.log("have available files: " + ret);
                    })
                    .catch((err: Error) => self.setState({ error: err.toString() }))
                    ;
            });
	}


    render() {
        var errmsg = (this.state.error)
            ? (<div className="alert alert-danger">{this.state.error as string}</div>)
            : "";

        var filenames = this.state.availableFiles.map((filename) => (<div>
            <button onClick={() => this.setCurrentFile(filename)}>{filename}</button>
        </div>));

        return (
          <div className="App">
              <h1>Working on TypeScript :)</h1>
              <b>You're on project { projectID }!</b>
              {errmsg}

              <div> {filenames} </div>

              <textarea placeholder='Loading...'
                        style={{ margin: 0, width: "100%", height: "100%" }}
                        onChange={this.updateCode}
                        value={this.state.code}
                        >
              </textarea>

              <button onClick={this.startAnim}>Start</button>
              <button onClick={this.stopAnim}>Stop</button>

              {/* TODO: best way to choose dimensions? */}
              <canvas id="gameCanvas" width="800" height="450" style={{ border: "1px solid red" }}/>
          </div>
        );
    }

    loadCode(str: string) {
        let newcode = "(function(elapsed) {" + str + "})";

        this.setState({
            code:   newcode,
            evaled: eval(newcode),
        });
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
        this.getProject()
            .then((proj) => {
                fetch(proj.codefiles)
                    .then((response) => response.json())
                    .then((objs) => {
                        for (var x in objs) {
                            if (objs[x].name == self.state.currentFile) {
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

    startAnim(e: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.running) {
            this.setState({ running: true });

            // XXX: cache busting, very bad no good... but there doesn't
            //      seem to be another option. I think the memory impact of this
            //      should be minimal since the module is only referenced
            //      in the looper function, so should be GC'd, although it might
            //      fill the browser cache
            //
            //      t. https://github.com/nodejs/modules/issues/307#issuecomment-764560656
            let rand = Math.random().toString(36).substring(2);

            let path = window.location + rand + "/main.js";
            let self = this;

            import(/*webpackIgnore: true*/ path)
                .then((module) => {
                    function looper(timestamp: number) {
                        try {
                            module.loop(timestamp - self.state.start);

                            if (self.state.running) {
                                requestAnimationFrame(looper);
                            }

                        } catch (err: any) {
                            self.setState({ error: err.toString() });
                        }
                    }

                    requestAnimationFrame(looper);
                })
                .catch((err: Error) => self.setState({ error: err.toString() }))
                ;
        }
    }

    stopAnim(e: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ running: false });
    }
}

//export default App;
