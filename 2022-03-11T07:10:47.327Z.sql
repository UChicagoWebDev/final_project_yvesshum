DROP TABLE IF EXISTS last_seen_message;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS channel_members;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS channels;

CREATE TABLE channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT NOT NULL UNIQUE
);

CREATE TABLE users ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password_hash TEXT NOT NULL, 
    user_name TEXT NOT NULL UNIQUE,
    session_token TEXT NOT NULL
);

CREATE TABLE channel_members ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE messages ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
    replies_to INTEGER,
    user_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    FOREIGN KEY (replies_to) REFERENCES messages(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE last_seen_message ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_seen_message_id INTEGER,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
