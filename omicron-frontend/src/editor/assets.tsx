import React from 'react';
import {
	getProject,
	csrftoken,
	projectID,
} from '../utilities/project';

interface AssetProps {
	onOpenAsset: (filename: string) => void,
};

interface AssetState {
    availableFiles: string[],
	error:          string,
};

export default class AssetBrowser extends React.Component<AssetProps, AssetState> {
	constructor(props: AssetProps) {
		super(props);

        this.createFile = this.createFile.bind(this);
		this.state = {
			availableFiles: [],
			error: "",
		};

		this.updateProject();
	}

	updateProject() {
        let self = this;

		getProject()
            .then((proj: any) => {
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


    createFile() {
        let boxElement = document.getElementById("filenameInput");

        // TODO: errors
        if (boxElement == null) return;
        if (csrftoken === null) return;

        let box = boxElement as HTMLInputElement;
        var data = new FormData();
        data.append("filename", box.value);

        let settings = {
            method:  "POST",
            body:    data,
            headers: { "X-CSRFToken" : csrftoken, },
            // TODO: typescript has a value it expects for this,
            //       use that
            // TODO: hmm, does it really matter if we're running arbitrary
            //       javascript anyway, is there a way to sandbox 3rd-party
            //       code?
            //mode: "same-origin",
        };

        fetch("/createFile/" + projectID + "/", settings)
            .then((response) => this.updateProject());
    }

	render() {
        var filenames = this.state.availableFiles.map((filename) => (<div>
            {'' /*<button onClick={() => this.setCurrentFile(filename)}>{filename}</button> */}
            <button onClick={() => this.props.onOpenAsset(filename)}>{filename}</button>

        </div>));

		return <>
			<div className="col-2">
			  <div> {filenames} </div>

			  <div className="input-group mb-3">
				  <input id="filenameInput"
						 type="text"
						 className="form-control"
						 placeholder="Filename"></input>
				  <button onClick={this.createFile}>Create</button>
			  </div>
			</div>
		</>
	}

}
