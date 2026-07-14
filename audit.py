import os, glob
from bs4 import BeautifulSoup
import re

print("Running Website Audit...")
print("------------------------")

html_files = glob.glob("*.html")
all_files = set(os.listdir("."))
for root, _, files in os.walk("images"):
    for f in files:
        all_files.add(f"images/{f}")
for root, _, files in os.walk("assets"):
    for f in files:
        all_files.add(f"assets/{f}")

missing_assets = set()
broken_links = set()
url_mismatches = []
target_url = "https://script.google.com/macros/s/AKfycbwtv-SNOpiiZEYRWldEfDGFZgcjRqyCv-6A--64Lw2F3Sz9dNtwz7OCgj3QCeB35lx8/exec"

def check_file(path):
    path = path.split('?')[0] # remove query params like ?v=1
    path = path.split('#')[0] # remove hashes
    if path.startswith('http') or path.startswith('mailto:') or path.startswith('tel:'):
        return True
    if not os.path.exists(path):
        return False
    return True

for html_file in html_files:
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Check Images
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and not check_file(src):
                    missing_assets.add(f"Missing image in {html_file}: {src}")
                    
            # Check Scripts
            for script in soup.find_all('script'):
                src = script.get('src')
                if src and not check_file(src):
                    missing_assets.add(f"Missing script in {html_file}: {src}")
                    
            # Check CSS
            for link in soup.find_all('link', rel='stylesheet'):
                href = link.get('href')
                if href and not check_file(href):
                    missing_assets.add(f"Missing CSS in {html_file}: {href}")
                    
            # Check Links
            for a in soup.find_all('a'):
                href = a.get('href')
                if href and not check_file(href):
                    broken_links.add(f"Broken link in {html_file}: {href}")
                    
    except Exception as e:
        print(f"Error parsing {html_file}: {e}")

# Check JS files for Google Script URL
js_files = glob.glob("*.js") + html_files
for js_file in js_files:
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
        urls = re.findall(r'https://script\.google\.com/macros/s/[a-zA-Z0-9_-]+/exec', content)
        for url in urls:
            if url != target_url:
                url_mismatches.append(f"Mismatched Google Script URL in {js_file}: {url}")

print("\n--- Missing Assets ---")
for x in sorted(missing_assets): print(x)
if not missing_assets: print("None found!")

print("\n--- Broken Links ---")
for x in sorted(broken_links): print(x)
if not broken_links: print("None found!")

print("\n--- Mismatched Script URLs ---")
for x in sorted(url_mismatches): print(x)
if not url_mismatches: print("None found!")
