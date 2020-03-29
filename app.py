#! venv/bin/python

from flask import Flask, render_template, jsonify
from grab_data import pull_flatten_data
from datetime import datetime

START_DATE = '2020-03-05'
URL = 'https://www.bing.com/covid/graphdata'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    data = pull_flatten_data(URL, START_DATE)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)