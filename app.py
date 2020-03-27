#! venv/bin/python

from flask import Flask, render_template, jsonify
import pandas as pd
import requests

START_DATE = '2020-03-01'
URL = 'https://www.bing.com/covid/graphdata'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def get_data():
    response = requests.get(URL).json()
    
    states = [k for k in response.keys() if 'unitedstates' in k][:51]
    territories = ['guam',
                    'puertorico',
                    'americansamoa',
                    'usvirginislands',
                    'northernmarianaislands']
    states += territories

    data = [{'state': s.replace('_unitedstates', ''), 'data': response[s]} for s in states]
    for datum in data:
        datum['data'][:] = [d for d in datum['data'] if d['date'] >= START_DATE]

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)