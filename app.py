#! venv/bin/python

from flask import Flask, render_template, jsonify
from grab_data import retrieve_data
from datetime import datetime

START_DATE = '2020-03-01'
URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    data = retrieve_data(URL, START_DATE)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)