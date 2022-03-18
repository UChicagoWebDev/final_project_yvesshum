import React, { useState } from "react";
import { Card, Button, Stack, Container, Row, Col, Modal, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getUnreadMessageCounts, getUserChannels } from "../Services/api";
import { PURPLE, WHITE } from "../Utils/colors";
import { useInterval } from "../Utils/hooks";
import ChatWindow from "./ChatWindow/ChatWindow";
import LoadingModal from "./LoadingModal";
import Sidebar from "./Sidebar/Sidebar";
export default function Home() {
    const [channels, setChannels] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState(null);
    const channel_id = useParams().channel_id;
    useInterval(() => {
        getUserChannels().then(({ channels }) => setChannels(channels));
        getUnreadMessageCounts().then((unseen_messages) => setUnseenMessages(unseen_messages));
    }, 1000);
    if (channels == null || unseenMessages == null) {
        return <LoadingModal show={channels == null || unseenMessages == null} />;
    }
    return (
        <Container fluid style={{ height: "100%" }}>
            <Row style={{ background: "#f8f9fa", height: "100%" }}>
                <Col
                    className="d-none d-lg-block"
                    style={{
                        background: PURPLE,
                        position: "relative",
                        paddingLeft: 0,
                        paddingRight: 0,
                        width: "300px",
                        maxWidth: "300px",
                    }}
                >
                    <Sidebar channels={channels} unseenMessages={unseenMessages} />
                </Col>
                <Col style={{ paddingLeft: 0, paddingRight: 0 }}>
                    {channel_id && (
                        <ChatWindow channel_id={channel_id} channels={channels} unseenMessages={unseenMessages} />
                    )}
                </Col>
            </Row>
        </Container>
    );
}
