#! venv/bin/python
import requests
import os
import pandas as pd

def pull_flatten_data(url, start_date, stop_date):
    response = requests.get(url).json()
    
    states = [k for k in response.keys() if 'unitedstates' in k][:51]
    states += ['puertorico']

    pop_df = pd.read_csv(os.path.join('data', 'census_est_2019.csv'), sep='\t')
    
    data = [{'state': s.replace('_unitedstates', ''), 'data': response[s]} for s in states]
    flattened_data = []
    for datum in data:
        state_pretty_name = pop_df.loc[pop_df.name == datum['state'], 'pretty_name'].iloc[0]
        state_pop = float(pop_df.loc[pop_df.name == datum['state'], 'pop_est_19'].iloc[0])
        datum['data'][:] = [d for d in datum['data'] if (d['date'] >= start_date) and (d['date'] <= stop_date)]
        for d in datum['data']:
            active = d['confirmed'] - d['recovered'] - d['fatal']
            flattened_data.append({'state': state_pretty_name,
                                    'date': d['date'],
                                    'confirmed': d['confirmed'],
                                    'fatal': d['fatal'],
                                    'recovered': d['recovered'],
                                    'active': active,
                                    'population': state_pop,
                                    'active_per_100k': 100000. * active / state_pop})
    return sorted(flattened_data, key = lambda d: d['state'])