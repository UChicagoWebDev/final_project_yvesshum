import { Modal, Spinner } from "react-bootstrap";

export default function LoadingModal({ show }) {
    return (
        <Modal show={show}>
            <Modal.Body style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                <h1>Loading</h1>
                <br />
                <Spinner animation="border" style={{ margin: "0 auto" }} />
            </Modal.Body>
        </Modal>
    );
}
