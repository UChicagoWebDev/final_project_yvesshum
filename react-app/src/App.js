import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Coponents/Home";
import Login from "./Coponents/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
    return (
        <div className="App">
            <ToastContainer />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/channels/:channel_id" element={<Home />} />

                <Route path="login" element={<Login />} />
            </Routes>
        </div>
    );
}

export default App;
