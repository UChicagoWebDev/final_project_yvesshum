import "./Message.css";
export default function Message({ user_name, message, timestamp, threadMessages }) {
    return (
        <div style={{ padding: "1rem", display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div className="circle">
                <span className="initials">{user_name[0]}</span>
            </div>
            <div>
                <div>
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
                </div>
                <div>
                    <p style={{ color: "black", textAlign: "left" }}>{message}</p>
                </div>
            </div>
        </div>
    );
}
