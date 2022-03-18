import { useEffect, useRef, useState } from "react";
import { Button, Form, FormText, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getChannelDetails, getChannelMessages, sendMessage, updateLastSeenMessage } from "../../Services/api";
import ChatHeader from "./Header";
import Message from "./Message";

export default function ChatWindow({ channel_id }) {
    const savedCallback = useRef();
    const bottomRef = useRef(null);
    const lastReceivedMessageID = useRef(null);
    const [messages, setMessages] = useState(null);
    const [channel, setChannel] = useState(null);
    const [textBox, setTextBox] = useState("");

    useEffect(() => {
        setMessages(null);
        setChannel(null);
        getChannelDetails(channel_id).then(({ channel, num_members }) => {
            setChannel({ ...channel, num_members });
        });

        savedCallback.current = async () => {
            let { messages } = await getChannelMessages(channel_id);
            setMessages(messages);
        };
    }, [channel_id]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        let id = setInterval(tick, 2000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (messages) {
            let lastMessageId = messages[messages.length - 1].message_id;
            if (lastReceivedMessageID.current != lastMessageId) {
                lastReceivedMessageID.current = lastMessageId;
                bottomRef.current?.scrollIntoView({ behaviour: "auto" });
                updateLastSeenMessage(channel_id, lastMessageId);
            }
        }
    }, [messages, channel_id]);

    const handleTextBoxChange = (event) => {
        setTextBox(event.target.value);
    };

    const handleSendClick = async () => {
        try {
            let message = textBox;
            setTextBox("");
            await sendMessage(channel_id, message, null);
        } catch (error) {
            console.log(error);
            toast.error("Sorry :( unable to send message");
        }
    };

    const handleTextBoxKeyDown = (e) => {
        if (e.key == "Enter") {
            handleSendClick();
        }
    };

    let isLoading = channel == null || messages == null;
    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div
            style={{
                height: "100vh",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <ChatHeader channel={channel} />
            <div style={{ overflowY: "scroll", marginBottom: "5rem" }}>
                {messages.map(({ message, message_id, user_name, replies_to, timestamp }) => (
                    <div key={message_id}>
                        <Message user_name={user_name} message={message} timestamp={timestamp} threadMessages={[]} />
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>
            <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
                <div
                    style={{
                        padding: "1rem",
                        // margin: "1rem",
                        borderTop: "1px solid var(--bs-gray-400)",
                        display: "flex",
                        gap: "1rem",
                        flexDirection: "row",
                    }}
                >
                    <Form.Control
                        value={textBox}
                        style={{ display: "inline" }}
                        type="text"
                        placeholder={`Message #${channel.channel_name}`}
                        onChange={handleTextBoxChange}
                        onKeyDown={handleTextBoxKeyDown}
                    />
                    <Button
                        style={{
                            backgroundColor: "var(--green)",
                            border: 0,
                        }}
                        height="1rem"
                        disabled={textBox.length == 0}
                        onClick={handleSendClick}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
