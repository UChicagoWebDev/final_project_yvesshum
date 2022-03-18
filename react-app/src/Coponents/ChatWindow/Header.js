import { useState } from "react";
import { Button } from "react-bootstrap";
import { IoMenu, IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
export default function ChatHeader({ showBackButton, channel_name, num_members, channels, unseenMessages }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const handleMenuClick = () => {
        setMenuOpen(true);
    };
    return (
        <div
            style={{
                borderBottom: "1px solid var(--bs-gray-400)",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
            }}
        >
            {menuOpen && (
                <div>
                    <div
                        style={{
                            position: "absolute",
                            backgroundColor: "var(--purple)",
                            height: "100vh",
                            top: 0,
                            left: 0,
                            zIndex: 3,
                            maxWidth: "300px",
                        }}
                    >
                        <Sidebar channels={channels} unseenMessages={unseenMessages} />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 2,
                            height: "100vh",
                            width: "100vw",
                            top: 0,
                            left: 0,
                            backgroundColor: "#b6b6b688",
                        }}
                        onClick={() => setMenuOpen(false)}
                    ></div>
                </div>
            )}
            <Button
                className="d-lg-none d-block"
                onClick={handleMenuClick}
                style={{ backgroundColor: "var(--purple)", border: 0 }}
            >
                <IoMenu />
            </Button>
            {showBackButton && (
                <Button
                    onClick={() => navigate(-1)}
                    style={{ backgroundColor: "purple", border: 0, marginLeft: "1rem" }}
                >
                    <IoArrowBackSharp />
                </Button>
            )}
            <p
                style={{
                    fontSize: "1.5rem",
                    color: "black",
                    textAlign: "left",
                    paddingLeft: "1rem",
                    fontWeight: "bold",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                    width: "70%",
                    marginRight: "1rem",
                    position: "relative",
                    flex: 1,
                }}
            >
                # {channel_name}
            </p>
            <p
                style={{
                    color: "var(--bs-gray-600)",
                    fontSize: "1rem",
                    marginLeft: "auto",
                    border: "1px solid var(--bs-gray-600)",
                    marginRight: "1rem",
                    padding: "0.25rem",
                    borderRadius: "0.25rem",
                    position: "relative",
                }}
            >
                {num_members}
            </p>
        </div>
    );
}
