import React from "react";
import { Button, Form, Container, Row, Col, Stack } from "react-bootstrap";
import { createAccount, login } from "../Services/api";

export default function Login() {
    const [userName, setUserName] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = (event) => {
        event.preventDefault();
        login(userName, password);
    };

    const handleCreate = (event) => {
        event.preventDefault();
        createAccount(userName, password);
    };

    return (
        <Container size="sm">
            <Row className="justify-content-md-center">
                <Col xs md="8" lg="4">
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>User Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter user name"
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Stack direction="horizontal">
                            <Button variant="primary" onClick={handleLogin}>
                                Login
                            </Button>
                            <Button variant="info" onClick={handleCreate} className="ms-auto">
                                Create Account
                            </Button>
                        </Stack>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
