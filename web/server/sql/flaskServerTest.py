import requests
import json

# For the 'train' endpoint
response = requests.post('http://localhost:7000/train')
print(response.status_code)
print(response.json())

# For the '/getRecs' endpoint
data = {"anime_titles": ["Vanitas no Karte", "Boku no Hero Academia"]}
headers = {'Content-Type': 'application/json'}
response = requests.post('http://localhost:7000/getRecs', data=json.dumps(data), headers=headers)
print(response.status_code)
if response.status_code == 500:
    print(response.text)
else:
    print(response.json())