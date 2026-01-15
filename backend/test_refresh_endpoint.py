import requests
import json

url = "http://localhost:8000/api/m&m/refresh-simulated-data"

try:
    print(f"Testing POST {url}")
    response = requests.post(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
