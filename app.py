import string
import random
import os
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

### Utils #####################################################################


def generate_random_pass():
    return ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=40))


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


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

################################################################################

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
    user = query_db(
        "INSERT INTO users (password_hash, user_name, session_token) VALUES (?, ?, ?)", [pw_hash, user_name, session_token])
    print(query_db("SELECT * FROM users;"))
    # query_db('INSERT INTO users (password_hash, user_name, session_token) VALUES ("123", "ys", "1234567")')
    print("create user", user)
    return session_token, 200


################################################################################


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)
