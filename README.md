# CoVis

Heatmap created with [D3.js](https://d3js.org/) which shows how the Active COVID-19 cases per 100,000 people in each US state has evolved over time. Data is sourced from Microsoft's Bing COVID-19 API located [here](https://www.bing.com/covid/graphdata).

### To run it yourself:
To run this app and render the D3 in a browser on your local machine, clone the repo and run the following from the command line within the CoVis directory:

```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The Flask app will serve the visualization on a port on your machine, typically 5000. Navigate to `localhost:5000` in a web browser to view the visualization.