import React from 'react';
import './App.css';

import AssetBrowser from './editor/assets';
import CodeEditor   from './editor/code';

import {projectID} from './utilities/project';

// TODO: should probably store, pass canvas context in as a parameter
/*
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
*/

type Properties = {
    [name: string]: any
};

interface AppState {
    currentFile:    string,
    running:        boolean,
    start:          number,
    error:          string | null,
};

export default class App extends React.Component<{}, AppState> {
    constructor(props: Properties) {
        super(props);

        this.startAnim   = this.startAnim.bind(this);
        this.stopAnim    = this.stopAnim.bind(this);
		this.onOpenAsset = this.onOpenAsset.bind(this);

        this.state = {
            currentFile:    "main.js",
            //evaled:         function (elapsed: number) {},
            running:        false,
            start:          -1,
            error:          null,
        };
    }

	onOpenAsset(asset: string) {
		console.log(`got here, opening '${asset}'`);
		this.setState({ currentFile: asset });
	}

    render() {
		console.log("current file: " + this.state.currentFile);
        var errmsg = (this.state.error)
            ? (<div className="alert alert-danger">{this.state.error as string}</div>)
            : "";

        return <div className="App">
             <b>You're on project #{ projectID }!</b>
             {errmsg}

             <div className="container m-0">
               <div className="row">
                   <div className="btn-toolbar justify-content-end" role="toolbar">
                       <div className="btn-group" role="group">
                           <button className="btn btn-secondary"
                                   type="button"
                                   onClick={this.startAnim}>Start</button>

                           <button className="btn btn-danger"
                                   type="button"
                                   onClick={this.stopAnim}>Stop</button>
                       </div>
                   </div>
               </div>

                {!this.state.running &&
                   <div className="row">
                       <AssetBrowser onOpenAsset={this.onOpenAsset} />
                       <CodeEditor filename={this.state.currentFile} />
                   </div>}

                {this.state.running &&
                    <canvas id="gameCanvas"
                            width="800"
                            height="450"
                            style={{ border: "1px solid red" }}/>}

             </div>
           {/* TODO: best way to choose dimensions? */}
        </div>;
    }

	/*
    loadCode(str: string) {
        let newcode = "(function(elapsed) {" + str + "})";

        this.setState({
            code:   newcode,
            evaled: eval(newcode),
        });
    }
	*/


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
