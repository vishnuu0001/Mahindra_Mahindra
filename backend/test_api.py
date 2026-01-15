import requests
import json

try:
    response = requests.get('http://127.0.0.1:8000/api/m&m/rating-scales')
    print(f'Status Code: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print(f'\nSuccess! Received {len(data)} rating scales')
        if data:
            print(f'\nFirst entry:')
            print(json.dumps(data[0], indent=2))
    else:
        print(f'\nError response:')
        print(response.text)
except Exception as e:
    print(f'Error: {e}')
