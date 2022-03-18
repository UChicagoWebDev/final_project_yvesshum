export default function ChatHeader({ channel }) {
    return (
        <div
            style={{
                borderBottom: "1px solid var(--bs-gray-400)",
                padding: "0.5rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
            }}
        >
            <p
                style={{
                    fontSize: "1.5rem",
                    color: "black",
                    textAlign: "left",
                    paddingLeft: "1rem",
                    fontWeight: "bold",
                    textOverflow: "ellipsis",
                }}
            >
                # {channel.channel_name}
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
                }}
            >
                {channel.num_members} Member{channel.num_members > 1 ? "s" : ""}
            </p>
        </div>
    );
}
