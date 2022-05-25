import React from 'react';
import logo from './logo.svg';
import './App.css';

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
    currentFile: string,
    code:        string,
    evaled:      (elapsed: number) => void,
    running:     boolean,
    start:       number,
};

export default class App extends React.Component<{}, AppState> {
    constructor(props: Properties) {
        super(props);

        this.updateCode  = this.updateCode.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.startAnim   = this.startAnim.bind(this);
        this.stopAnim    = this.stopAnim.bind(this);
        this.animFrame   = this.animFrame.bind(this);

        this.state = {
            currentFile: "main.js",
            code:        "",
            evaled:      function (elapsed: number) {},
            running:     false,
            start:       -1,
        };

        // TODO: load main.js
        //this.loadCode(initialCode);
    }

    render() {
        return (
          <div className="App">
              <h1>Working on TypeScript :)</h1>
              <textarea rows={10}
                        cols={45}
                        placeholder='Loading...'
                        onChange={this.updateCode}
                        defaultValue={initialCode}
                        >
              </textarea>

              <button onClick={this.handleClick}>Load</button>
              <button onClick={this.startAnim}>Start</button>
              <button onClick={this.stopAnim}>Stop</button>

              {/* TODO: best way to choose dimensions? */}
              <canvas id="gameCanvas" width="800" height="450" style={{ border: "1px solid red" }}/>
          </div>
        );
    }

    animFrame(timestamp: number) {
        if (this.state.start < 0) {
            this.setState({
                start: timestamp,
            })
        }

        this.state.evaled(timestamp - this.state.start);

        if (this.state.running) {
            requestAnimationFrame(this.animFrame);
        }
    }

    loadCode(str: string) {
        let newcode = "(function(elapsed) {" + str + "})";

        this.setState({
            code:   newcode,
            evaled: eval(newcode),
        });
    }

    updateCode(e: React.ChangeEvent<HTMLTextAreaElement>) {
        this.setState({
            code: "(function(elapsed) {" + e.target.value + "})",
        });
    };

    handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ evaled: eval(this.state.code) });
        console.log(this.state.code);
    }

    startAnim(e: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ running: true });
        requestAnimationFrame(this.animFrame);
    }

    stopAnim(e: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ running: false });
    }
}

//export default App;
