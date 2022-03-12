import axios from "axios";
import { history } from "../index";
axios.interceptors.request.use((config) => {
    console.log("localStorage", localStorage.getItem("yvesshum-belay-auth-token"));
    config.headers["yvesshum-belay-auth-key"] = localStorage.getItem("yvesshum-belay-auth-token");
    return config;
});

axios.interceptors.response.use(
    (resp) => resp,
    (error) => {
        if (error.response.status === 401) {
            window.alert("You are not authenticated");
            history.push("login");
        }
        throw error;
    }
);

export async function login(user_name, password) {
    try {
        let resp = await axios.post("/api/login", { user_name, password });
        localStorage.setItem("yvesshum-belay-auth-token", resp.data);
        history.push("/");
    } catch (error) {
        window.alert(`Error ${error.response.data}`);
    }
}

export async function createAccount(user_name, password) {
    try {
        let session_token = await axios.post("/api/create-user", { user_name, password });
        localStorage.setItem("yvesshum-belay-auth-token", session_token);
        history.push("/");
    } catch (error) {
        window.alert(`Error ${error.response.data}`);
    }
}

export async function getUserChannels() {
    let resp = await axios.get("/api/user/channels");
    return resp.data;
}
