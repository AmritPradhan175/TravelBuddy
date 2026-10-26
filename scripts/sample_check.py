import pandas as pd
import ast
import json

df = pd.read_csv('data/india_tourism_dataset.csv')
print(f"Total destinations: {len(df)}")
for idx, r in df.head(15).iterrows():
    print(f"ID {r['id']}: {r['destination_name']} | State: {r['state']} | Region: {r['region']}")
