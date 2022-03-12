import React from "react";
import { Card, Button, Stack } from "react-bootstrap";
import { getUserChannels } from "../Services/api";
export default function Home() {
    React.useEffect(() => {
        async function getChannels() {
            let channels = await getUserChannels();
            console.log("channels", channels);
        }

        getChannels();
    });
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Card style={{ width: "18rem" }}>
                <Card.Title>Welcome to Belay</Card.Title>
            </Card>
        </div>
    );
}
