import React from 'react';
import logo from './logo.svg';
import './App.css';

var state = {
    code: "",
    evaled: function (elapsed: number) {},
    running: false,
    start: -1,
};

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

const animFrame = (timestamp: number) => {
    if (state.start < 0) {
        state.start = timestamp;
    }

    state.evaled(timestamp - state.start);

    if (state.running) {
        requestAnimationFrame(animFrame);
    }
}

const loadCode = (str: string) => {
    state.code = "(function(elapsed) {" + str + "})";
    state.evaled = eval(state.code);
}

const updateCode = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    state.code = "(function(elapsed) {" + e.target.value + "})";
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    state.evaled = eval(state.code);
    console.log(state.code);
}

const startAnim = (e: React.MouseEvent<HTMLButtonElement>) => {
    state.running = true;
    requestAnimationFrame(animFrame);
}

const stopAnim = (e: React.MouseEvent<HTMLButtonElement>) => {
    state.running = false;
}

const App: React.FunctionComponent = () => {
  loadCode(initialCode);

  return (
    <div className="App">
        <h1>Working on TypeScript :)</h1>
        <textarea rows={10}
                  cols={45}
                  placeholder='Place Imaginary Code Here!'
                  onChange={updateCode}
                  defaultValue={initialCode}
                  >
        </textarea>

        <button onClick={handleClick}>Load</button>
        <button onClick={startAnim}>Start</button>
        <button onClick={stopAnim}>Stop</button>

        {/* TODO: best way to choose dimensions? */}
        <canvas id="gameCanvas" width="800" height="450" style={{ border: "1px solid red" }}/>
    </div>
  );
}

export default App;
