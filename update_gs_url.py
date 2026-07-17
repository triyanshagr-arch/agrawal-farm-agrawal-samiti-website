import os

old_url = 'https://script.google.com/macros/s/AKfycbyb194qKqY_sO2oXQp2b8h_1n228b7jN19iHnS_R1w1F7d5hF6qB3L7_H1d_g1f1a1/exec'
new_url = 'https://script.google.com/macros/s/AKfycbxY6kQq6RjVfZfkPCpOLIWF2SojN52zw4jK0N29B2rr4YmvZZg56PyRSjLBVRTSjLhD/exec'

for root, _, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if f.endswith('.html') or f.endswith('.js'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                if old_url in content:
                    content = content.replace(old_url, new_url)
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(content)
                    print(f'Updated URL in {path}')
            except Exception as e:
                print(f'Error in {path}: {e}')
