import re
import time
import os

def update_html_cache():
    new_version = str(int(time.time()))
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'href="style\.css\?v=[0-9]+"', f'href="style.css?v={new_version}"', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
    print(f"Updated HTML cache busters to {new_version}")

if __name__ == '__main__':
    update_html_cache()
