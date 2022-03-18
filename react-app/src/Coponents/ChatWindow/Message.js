import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Message.css";
export default function Message({ disableReplyButton, user_name, message_id, message, timestamp, threadMessages }) {
    const navigate = useNavigate();
    const handleReplyClick = () => {
        navigate(`${window.location.pathname}/message/${message_id}`);
    };

    const re = /https?:.*?\.(?:png|jpg|svg)/g;
    let imageURLs = [...message.matchAll(re)];

    return (
        <div style={{ padding: "1rem", display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div className="circle">
                <span className="initials">{user_name[0]}</span>
            </div>
            <div>
                <div style={{ textAlign: "left" }}>
                    <p
                        style={{
                            display: "inline",
                            fontSize: "1.25rem",
                            lineHeight: "1.25rem",
                            fontWeight: "bold",
                            color: "black",
                        }}
                    >
                        {user_name}
                    </p>
                    <p style={{ display: "inline", marginLeft: "1rem", color: "black" }}>
                        {new Date(timestamp).toLocaleString()}
                    </p>
                    {!disableReplyButton && (
                        <p
                            style={{ display: "inline", marginLeft: "1rem", color: "var(--bs-blue)" }}
                            className="reply"
                            onClick={handleReplyClick}
                        >
                            Reply {threadMessages.length > 0 && `(${threadMessages.length})`}
                        </p>
                    )}
                </div>
                <div>
                    <p style={{ color: "black", textAlign: "left" }}>{message}</p>
                </div>
                <div>
                    {imageURLs.map((image, id) => (
                        <Image
                            key={id}
                            style={{ margin: "1rem", border: "1px solid var(--bs-gray-400)" }}
                            src={image}
                            width="70%"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
