import os
from flask import Flask, render_template, request, jsonify, send_from_directory, Blueprint
from functools import wraps

app = Flask(__name__, static_folder='react-app/build')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/test')
def test():
    return "Ok"


if __name__ == '__main__':
    app.run(use_reloader=True, port=5000, threaded=True)
