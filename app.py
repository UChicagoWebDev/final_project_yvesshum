import string
import random
import os
from time import time
from flask import Flask, render_template, request, jsonify, send_from_directory
from functools import wraps
import sqlite3
from flask import g
from flask_bcrypt import Bcrypt


DATABASE = 'belay.db'

app = Flask(__name__, static_folder='react-app/build')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
bcrypt = Bcrypt(app)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


### DB Helpers #################################################################

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def query_db(query, args=(), one=False):
    conn = get_db()
    conn.row_factory = dict_factory
    cur = conn.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    conn.commit()
    return (rv[0] if rv else None) if one else rv


def insert_db(query, args=()):
    conn = get_db()
    cur = conn.execute(query, args)
    lastrowid = cur.lastrowid
    cur.close()
    conn.commit()
    return lastrowid


### Utils #####################################################################

def generate_random_pass():
    return ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=40))


def get_user_by_auth_key(auth_key):
    result = query_db(
        "SELECT id, password_hash, user_name, session_token FROM users WHERE session_token = ?", [auth_key], one=True)
    print("user", result)
    return result


def is_authorized(auth_key):
    return get_user_by_auth_key(auth_key) != None

### API ########################################################################


@app.route('/api/test')
def test():
    print("test")
    return {"message": "Ok"}


@app.route('/api/login', methods=["POST"])
def login():
    body = request.json
    user_name = body["user_name"]
    password = body["password"]

    user = query_db("SELECT password_hash, session_token FROM users WHERE user_name = ?", [
        user_name], one=True)

    if user == None:
        return "Username or Password does not exist", 401

    is_correct_pw = bcrypt.check_password_hash(user["pw_hash"], password)

    if (is_correct_pw):
        return user["session_token"], 200
    else:
        return "Incorrect Username or Password", 401


@app.route('/api/create-user', methods=["POST"])
def create_user():
    body = request.json
    user_name = body["user_name"]
    password = body["password"]
    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    session_token = generate_random_pass()
    try:
        insert_db(
            "INSERT INTO users (password_hash, user_name, session_token) VALUES (?, ?, ?)", [pw_hash, user_name, session_token])
        return session_token, 200
    except sqlite3.IntegrityError:
        return "User name is already token", 400


@app.route('/api/user/<int:user_id>/channels', methods=["GET"])
def get_user_channels(user_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    return {"channels": query_db("SELECT channel_id, channel_name FROM channels INNER JOIN channel_members ON channels.id = channel_members.channel_id WHERE channel_members.user_id = ?", [user_id])}


@app.route('/api/last_seen_messages', methods=["GET"])
def get_user_last_seen_messages():
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    user = get_user_by_auth_key(request.headers.get("yvesshum-belay-auth-key"))

    return {"last_seen_messages": query_db("SELECT ")}


@app.route('/api/channels/<int:channel_id>/last_seen_message', methods=["POST"])
def set_user_channel_last_seen_message(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401
    body = request.json
    last_seen_message_id = body["last_seen_message_id"]
    user = get_user_by_auth_key(request.headers.get("yvesshum-belay-auth-key"))
    user_id = user["id"]
    existing_record = query_db("SELECT id FROM last_seen_message WHERE channel_id = ? AND user_id = ?", [
                               channel_id, user_id], one=True)
    if existing_record == None:
        insert_db("INSERT INTO last_seen_message (last_seen_message_id, channel_id, user_id) VALUES (?, ?, ?)", [
            last_seen_message_id, channel_id, user_id])
    else:
        insert_db(
            "UPDATE last_seen_message SET last_seen_message_id = ? WHERE channel_id = ? AND user_id = ?", [last_seen_message_id, channel_id, user_id])
    return "Ok", 200


@app.route('/api/channels', methods=["GET"])
def get_channels():
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    return {"channels": query_db("SELECT id, channel_name FROM channels")}, 200


@app.route('/api/channels/<int:channel_id>', methods=["GET"])
def get_channel_by_id(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    return query_db("SELECT * FROM channels WHERE id = ?", [channel_id], one=True)


@app.route('/api/channels', methods=["POST"])
def create_channel():
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    body = request.json
    channel_name = body["channel_name"]

    try:
        channel_id = insert_db(
            "INSERT INTO channels (channel_name) VALUES (?)", [channel_name])
        user = get_user_by_auth_key(
            request.headers.get("yvesshum-belay-auth-key"))
        insert_db("INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)", [
            channel_id, user["id"]])

        insert_db("INSERT INTO last_seen_message (last_seen_message_id, channel_id, user_id) VALUES (0, ?, ?)", [
            channel_id, user["id"]])
        return "Ok"
    except sqlite3.IntegrityError:
        return "Channel name already exists", 400


@app.route('/api/channels/<int:channel_id>/participants', methods=["GET"])
def get_channel_participants(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    return {"participants": query_db("SELECT user_name, user_id FROM channel_members INNER JOIN users ON channel_members.user_id = users.id WHERE channel_members.channel_id = ?", [channel_id])}, 200


@app.route('/api/channels/<int:channel_id>/participants', methods=["POST"])
def join_channel(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    user = get_user_by_auth_key(request.headers.get("yvesshum-belay-auth-key"))

    insert_db("INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)", [
        channel_id, user["id"]])
    insert_db("INSERT INTO last_seen_message (last_seen_message_id, channel_id, user_id) VALUES (0, ?, ?)", [
              channel_id, user["id"]])

    return "Ok", 200


@app.route('/api/channels/<int:channel_id>/messages', methods=["GET"])
def get_channel_messages(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    messages = query_db(
        "SELECT * FROM messages WHERE channel_id = ?", [channel_id])
    return {"messages": messages}


@app.route('/api/channels/<int:channel_id>/messages', methods=["POST"])
def post_channel_messages(channel_id):
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    body = request.json
    user = get_user_by_auth_key(request.headers.get("yvesshum-belay-auth-key"))
    message = body["message"]
    replies_to = body["replies_to"]

    insert_db("INSERT INTO messages (message, replies_to, user_id, channel_id) VALUES (?, ?, ? , ?)", [
              message, replies_to, user["id"], channel_id])

    return "Ok", 200


@app.route('/api/unseen_message_count', methods=["GET"])
def get_unseen_message_count():
    if not is_authorized(request.headers.get("yvesshum-belay-auth-key")):
        return "Unauthorized", 401

    user = get_user_by_auth_key(request.headers.get("yvesshum-belay-auth-key"))

    unseen_messages = query_db(
        "SELECT messages.channel_id, COUNT(messages.id) AS num_unseen, channel_name FROM (SELECT channel_id, last_seen_message_id FROM last_seen_message WHERE user_id = ? GROUP BY channel_id) AS last_seen_channel_messages INNER JOIN messages on messages.channel_id = last_seen_channel_messages.channel_id INNER JOIN channels ON channels.id = messages.channel_id WHERE messages.id > last_seen_message_id GROUP BY messages.channel_id", [user["id"]])
    return {"unseen_messages": unseen_messages}, 200


################################################################################
if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)
