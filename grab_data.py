#! venv/bin/python
import requests
import os
import pandas as pd
import numpy as np
import itertools

def retrieve_data(url, start_date='2020-03-01'):
    nyt_df = pd.read_csv(url)
    pop_df = pd.read_csv(os.path.join('data', 'census_est_2019.csv'), sep='\t')

    dates = pd.unique(nyt_df.date)
    states = [s for s in pd.unique(nyt_df.state) if s in list(pop_df.state)]

    df = pd.DataFrame((itertools.product(states, dates)), columns = ['state', 'date'])
    df = df.merge(nyt_df, how='left')
    df = df.merge(pop_df, how='left')

    df.drop(['fips'], axis=1, inplace=True)
    us_df = df.groupby('date')[['cases', 'deaths', 'pop_est_19']].sum().reset_index()
    us_df['state'] = 'US Total'
    df = pd.concat([df, us_df], axis=0, sort=False)
    df.fillna(0., inplace=True)

    df['new_cases'] = df.groupby(['state'])['cases'].transform(lambda x: x.diff())
    df.loc[df.new_cases < 0, 'new_cases'] = 0.
    df['case_pct_growth'] = df.groupby(['state'])['cases'].transform(lambda x: x.pct_change()).replace([np.inf, -np.inf], np.nan)
    df['cases_per_100k'] = 100_000. * df['cases'] / df['pop_est_19']
    df['deaths_per_100k'] = 100_000. * df['deaths'] / df['pop_est_19']
    df['new_cases_per_100k'] = 100_000. * df['new_cases'] / df['pop_est_19']
    df.fillna(0., inplace=True)
    df = df.loc[df.date >= start_date]
    
    result = sorted([d for d in df.to_dict(orient='records') if d['state'] != 'US Total'],
                    key = lambda d: d['state'])
    result += [d for d in df.to_dict(orient='records') if d['state'] == 'US Total']
    return result