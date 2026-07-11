import urllib.request
import json
url = 'https://script.google.com/macros/s/AKfycbyAa5F3qja9vdo-8DA_vy9wOuLrQZTD-tDjAXjKrcYKlmaZXZHdyFfziFFlKt0e2BM/exec?action=get_matrimonial&password=admin'
try:
    with urllib.request.urlopen(url) as response:
        html = response.read()
        data = json.loads(html)
        profiles = data.get('profiles', [])
        print(f'Total profiles: {len(profiles)}')
        for p in profiles:
            print(f"Row: {p.get('row')}, Name: {p.get('name')}, Status: {p.get('status')}")
except Exception as e:
    print('Error:', e)
