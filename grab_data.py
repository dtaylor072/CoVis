#! venv/bin/python
import requests
import os
import pandas as pd
from datetime import datetime, timedelta
from dateutil.rrule import rrule, DAILY

def pull_flatten_data(url, start_date):
    response = requests.get(url).json()
    states = [k for k in response.keys() if 'unitedstates' in k][:51]
    
    # flatten json response
    data = [{'state': s.replace('_unitedstates', ''), 'data': response[s]} for s in states]
    flattened_data = []
    for datum in data:
        for d in datum['data']:
            flattened_data.append({'state': datum['state'],
                                    'date': d['date'],
                                    'confirmed': d['confirmed'],
                                    'fatal': d['fatal'],
                                    'recovered': d['recovered']})

    # create dataframe with entries for each state and day
    # allows for interpolation of missing data
    date_arr = list(map(lambda x: x.strftime('%Y-%m-%d'),
                        rrule(DAILY,
                              interval=1,
                              dtstart=datetime.strptime(start_date, '%Y-%m-%d'),
                              until=datetime.today() - timedelta(days=1))))
    temp = []
    for state in pd.unique([d['state'] for d in flattened_data]):
        for date in date_arr:
            temp.append({'state': state,
                        'date': date})
    temp_df = pd.DataFrame(temp)
    df = temp_df.merge(pd.DataFrame(flattened_data), how='left')

    # read in population data, merge and create cusom fields
    pop_df = pd.read_csv(os.path.join('data', 'census_est_2019.csv'))
    df = df.merge(pop_df, on='state', how='left')
    df.sort_values(by=['state', 'date'], inplace=True)
    df['active'] = df['confirmed'] - df['recovered'] - df['fatal']
    df['active_per_100k'] = 100_000. * df['active'] / df['pop_est_19']

    # fill missing data with linear interpolation
    df['active_per_100k'] = df.groupby('state').transform(lambda x: x.interpolate())['active_per_100k']
    df = df[['pretty_name', 'date', 'active_per_100k']].rename(columns={'pretty_name': 'state'})
    
    return df.to_dict(orient='records')