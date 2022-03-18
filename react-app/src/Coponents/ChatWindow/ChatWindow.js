import { useEffect, useRef, useState } from "react";
import { Button, Form, FormText, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getChannelDetails, getChannelMessages, sendMessage, updateLastSeenMessage } from "../../Services/api";
import ChatHeader from "./Header";
import Message from "./Message";
import "./ChatWindow.css";
export default function ChatWindow({ channel_id, channels, unseenMessages }) {
    const replyingToMessage = useParams().message_id;
    const savedCallback = useRef();
    const bottomRef = useRef(null);
    const lastReceivedMessageID = useRef(null);
    const [hide, setHide] = useState(false);
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
        if (messages && messages.length) {
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
            await sendMessage(channel_id, message, replyingToMessage || null);
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

    if (replyingToMessage) {
        let replyMessage = messages.find((m) => m.message_id == replyingToMessage);
        return (
            <div className="chatWindowContainer">
                <ChatHeader
                    showBackButton
                    channel_name={`Replying to ${replyMessage.user_name}`}
                    channels={channels}
                    unseenMessages={unseenMessages}
                />
                <div style={{ background: "var(--bs-gray-300)", textAlign: "left", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h4>Replying to message:</h4>
                        <Button style={{ backgroundColor: "var(--blue)", border: 0 }} onClick={() => setHide(!hide)}>
                            {hide ? "Show" : "Hide"}
                        </Button>
                    </div>
                    {!hide && (
                        <Message
                            message_id={replyMessage.message_id}
                            user_name={replyMessage.user_name}
                            message={replyMessage.message}
                            timestamp={replyMessage.timestamp}
                            threadMessages={replyMessage.threadMessages}
                            disableReplyButton
                        />
                    )}
                </div>
                <div className="messagesContainer">
                    {replyMessage.threadMessages.map(({ message, message_id, user_name, replies_to, timestamp }) => (
                        <div key={message_id}>
                            <Message
                                message_id={message_id}
                                user_name={user_name}
                                message={message}
                                timestamp={timestamp}
                                threadMessages={[]}
                                disableReplyButton
                            />
                        </div>
                    ))}
                    <div ref={bottomRef}></div>
                </div>
                <div className="textBoxContainer">
                    <div className="textBox">
                        <Form.Control
                            value={textBox}
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

    return (
        <div className="chatWindowContainer">
            <ChatHeader
                channel_name={channel.channel_name}
                num_members={channel.num_members}
                channels={channels}
                unseenMessages={unseenMessages}
            />
            <div className="messagesContainer">
                {messages
                    .filter((m) => m.replies_to == null)
                    .map(({ threadMessages, message, message_id, user_name, replies_to, timestamp }) => (
                        <div key={message_id}>
                            <Message
                                message_id={message_id}
                                user_name={user_name}
                                message={message}
                                timestamp={timestamp}
                                threadMessages={threadMessages}
                            />
                        </div>
                    ))}
                <div ref={bottomRef}></div>
            </div>
            <div className="textBoxContainer">
                <div className="textBox">
                    <Form.Control
                        value={textBox}
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
