import axios from "axios";
import { history } from "../index";
axios.interceptors.request.use((config) => {
    config.headers["yvesshum-belay-auth-key"] = localStorage.getItem("yvesshum-belay-auth-token");
    return config;
});

axios.interceptors.response.use(
    (resp) => resp,
    (error) => {
        if (error.response.status === 401) {
            history.push("/login");
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
        let resp = await axios.post("/api/create-user", { user_name, password });
        localStorage.setItem("yvesshum-belay-auth-token", resp.data);
        history.push("/");
    } catch (error) {
        window.alert(`Error ${error.response.data}`);
    }
}

export async function getUserChannels() {
    let resp = await axios.get("/api/user/channels");
    return resp.data;
}

export async function getUserNotInChannels() {
    let resp = await axios.get("/api/user/not-in-channels");
    return resp.data;
}

export async function getUnreadMessageCounts() {
    let resp = await axios.get("/api/unseen_message_count");
    let ret = {};
    resp.data.unseen_messages.forEach((r) => {
        ret[r.channel_id] = r;
    });
    return ret;
}

export async function updateLastSeenMessage(channel_id, last_seen_message_id) {
    let resp = await axios.post(`/api/channels/${channel_id}/last_seen_message`, {
        last_seen_message_id,
    });
    return resp.data;
}

export async function createChannel(channel_name) {
    let resp = await axios.post("/api/channels", { channel_name });
    return resp.data;
}

export async function joinChannel(channel_id) {
    let resp = await axios.post(`/api/channels/${channel_id}/participants`);
    return resp.data;
}

export async function getChannelDetails(channel_id) {
    let resp = await axios.get(`/api/channels/${channel_id}`);
    return resp.data;
}

export async function getChannelMessages(channel_id) {
    let resp = await axios.get(`/api/channels/${channel_id}/messages`);
    let ret = [];
    let messageIdIndexMapping = new Map();
    resp.data.messages.forEach((message) => {
        if (message.replies_to == null) {
            messageIdIndexMapping.set(message.message_id, ret.length);
            ret.push({ ...message, threadMessages: [] });
        } else {
            let index = messageIdIndexMapping.get(message.replies_to);
            ret[index].threadMessages.push(message);
            ret.push({ ...message, threadMessages: [] });
        }
    });
    return { messages: ret };
}

export async function sendMessage(channel_id, message, replies_to) {
    let resp = await axios.post(`/api/channels/${channel_id}/messages`, {
        message,
        replies_to,
    });

    return resp.data;
}
