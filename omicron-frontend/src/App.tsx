import React from 'react';
import logo from './logo.svg';
import './App.css';

var state = {
    code: "",
    evaled: function () {},
    running: false,
};

const animFrame = (timestamp: Number) => {
    state.evaled();

    if (state.running) {
        requestAnimationFrame(animFrame);
    }
}

const updateCode = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    state.code = "(function() {" + e.target.value + "})";
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
  return (
    <div className="App">
        <h1>Working on TypeScript :)</h1>
        <textarea rows={10}
                  cols={45}
                  placeholder='Place Imaginary Code Here!'
                  onChange={updateCode}
                  >
        console.log("testing this");
        </textarea>

        <button onClick={handleClick}>Load</button>
        <button onClick={startAnim}>Start</button>
        <button onClick={stopAnim}>Stop</button>

        {/* TODO: best way to choose dimensions? --> */}
        <canvas id="gameCanvas" width="800" height="450" style={{ border: "1px solid red" }}/>
    </div>
  );
}

export default App;
