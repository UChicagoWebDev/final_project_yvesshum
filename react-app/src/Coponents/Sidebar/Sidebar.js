import { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createChannel, getUserNotInChannels, joinChannel } from "../../Services/api";
import { WHITE } from "../../Utils/colors";
import "./Sidebar.css";

export default function Sidebar({ channels, unseenMessages }) {
    const navigate = useNavigate();
    const channel_id = useParams().channel_id;
    const [newChannelName, setChannelName] = useState("");
    const [newChannelModalVisible, setNewChannelModalVisible] = useState(false);
    const [browseModalVisible, setBrowseModalVisible] = useState(false);
    const [browseChannels, setBrowseChannels] = useState(null);
    const handleChannelClicked = (id) => {
        navigate(`/channels/${id}`);
    };

    const handleCreateChannel = () => {
        setChannelName("");
        setNewChannelModalVisible(true);
    };

    const handleNewChannelSubmit = async (e) => {
        e.preventDefault();
        setNewChannelModalVisible(false);
        toast("Creating new channel...");
        try {
            let status = await createChannel(newChannelName);
            toast.success("Succesfully created new channel");
        } catch (error) {
            if (error.response.status == 400) {
                toast.error(`Oh no a channel named "${newChannelName}" already exists`);
            }
        }
    };

    const handleBrowseClicked = async () => {
        setBrowseChannels(null);
        setBrowseModalVisible(true);
        let { channels } = await getUserNotInChannels();
        setBrowseChannels(channels);
    };

    const handleJoinChannel = async (channel_id, channel_name) => {
        setBrowseModalVisible(false);
        let status = await joinChannel(channel_id);
        toast.success(`Succesfully joined channel ${channel_name}`);
    };

    const sortedChannels = channels.sort((a, b) => {
        let aUnseen = unseenMessages[a.channel_id]?.num_unseen;
        let bUnseen = unseenMessages[b.channel_id]?.num_unseen;
        if (aUnseen && bUnseen) return bUnseen - aUnseen;
        return a.channel_name > b.channel_name;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
                style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid var(--bs-gray-600)",
                    width: "100%",
                    position: "relative",
                }}
            >
                <p style={{ fontSize: "1.5rem" }}>Channels</p>
                <div
                    style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "1rem",

                        fontWeight: "bold",
                    }}
                >
                    <Button onClick={handleCreateChannel} style={{ backgroundColor: "purple", border: 0 }}>
                        +
                    </Button>
                </div>
            </div>
            <div
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--bs-gray-600)" }}
            >
                <Button style={{ backgroundColor: "var(--bs-purple)", border: 0 }} onClick={handleBrowseClicked}>
                    Browse Channels
                </Button>
            </div>
            <div style={{ overflowY: "scroll", paddingTop: "0.5rem" }}>
                {sortedChannels.map((channel) => {
                    let numUnseenMessages = unseenMessages[channel.channel_id]?.num_unseen;
                    return (
                        <div
                            key={channel.channel_id}
                            className={`channelItem ${channel.channel_id == channel_id && "selectedChannelItem"}`}
                            onClick={() => handleChannelClicked(channel.channel_id)}
                            style={{ position: "relative" }}
                        >
                            <p style={{ display: "inline", marginRight: "1rem" }}>#</p>
                            <p style={{ display: "inline" }}>{channel.channel_name}</p>
                            {numUnseenMessages && (
                                <p
                                    style={{
                                        position: "absolute",
                                        right: "2rem",
                                        top: "0.25rem",
                                        backgroundColor: "var(--red)",
                                        borderRadius: "1rem",
                                        paddingLeft: "0.6rem",
                                        paddingRight: "0.6rem",
                                    }}
                                >
                                    {numUnseenMessages}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    marginTop: "auto",
                    borderTop: `1px solid var(--bs-gray-600)`,
                    width: "100%",
                    padding: "0.5rem",
                }}
            >
                <p>Belay 1.0</p>
            </div>

            <Modal show={newChannelModalVisible} onHide={() => setNewChannelModalVisible(false)}>
                <Modal.Header>
                    <Modal.Title>Create New Channel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Form.Label>New channel name</Form.Label>
                        <Form.Control type="text" rows={1} onChange={(e) => setChannelName(e.target.value)} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={() => setNewChannelModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        type="button"
                        onClick={handleNewChannelSubmit}
                        disabled={newChannelName.length == 0}
                    >
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={browseModalVisible} onHide={() => setBrowseModalVisible(false)}>
                <Modal.Header>
                    <Modal.Title>Browse New Channels</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {browseChannels == null ? (
                        <Spinner animation="border" />
                    ) : (
                        browseChannels.map(({ channel_id, channel_name }) => (
                            <div key={channel_id}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "1rem",
                                        alignItems: "center",
                                    }}
                                >
                                    <p style={{ color: "black" }}>#{channel_name}</p>
                                    <Button
                                        style={{ backgroundColor: "var(--bs-indigo)", border: 0 }}
                                        onClick={() => handleJoinChannel(channel_id, channel_name)}
                                    >
                                        Join
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}
