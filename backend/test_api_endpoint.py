import requests

# Test the endpoint
url = "http://localhost:8000/api/m&m/refresh-simulated-data"

print(f"Testing: {url}")
try:
    response = requests.post(url, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
except Exception as e:
    print(f"Error: {e}")
