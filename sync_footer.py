import os
import re
import glob

# 1. Read index.html to get the gold standard footer
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

footer_match = re.search(r'(<footer.*?>.*?</footer>)', index_html, re.DOTALL)
if not footer_match:
    print("Could not find footer in index.html")
    exit(1)

gold_footer = footer_match.group(1)

# 2. Iterate through all other HTML files and replace their footer
files = glob.glob('*.html')
for file in files:
    if file == 'index.html' or file == 'admin.html':
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Check if this file has a footer
    if re.search(r'<footer.*?>.*?</footer>', html, re.DOTALL):
        # Replace the footer
        new_html = re.sub(r'<footer.*?>.*?</footer>', gold_footer, html, flags=re.DOTALL)
        
        if new_html != html:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print(f"Updated footer in {file}")
    else:
        print(f"No footer found in {file}, skipping.")
