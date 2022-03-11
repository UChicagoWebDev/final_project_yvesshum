import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React from "react";
function App() {
    React.useEffect(async () => {
        let resp = await axios.get("/api/test");
        console.log(resp.data);
        // const response = await fetch("/api/test");
        // const body = await response.json();
        // console.log("Body", body);
    });

    return (
        <div className="App">
            <h1>Belay</h1>
        </div>
    );
}

export default App;
