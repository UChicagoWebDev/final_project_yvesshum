import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Coponents/Home";
import Login from "./Coponents/Login";
import NavBar from "./Coponents/NavBar";

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
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="login" element={<Login />} />
            </Routes>
        </div>
    );
}

export default App;
