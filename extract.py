import os
import re
import json

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
hindi_pattern = re.compile(r'[\u0900-\u097F]')

data = {}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strip scripts and styles
    content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL)
    
    # Find tags containing Hindi
    # We want <p>, <span>, <div>, <li>, <td>
    tags = re.findall(r'<([a-z0-9]+)[^>]*>([^<]*[\u0900-\u097F]+[^<]*)</\1>', content)
    
    file_data = set()
    for tag, text in tags:
        text = text.strip()
        if len(text) > 2 and 'lang-hi' not in text:
            file_data.add(text)
            
    # Also find ticker items
    ticker_tags = re.findall(r'<span class="ticker-item">.*?</i>([^<]+)</span>', content)
    for t in ticker_tags:
        if hindi_pattern.search(t):
            file_data.add(t.strip())
            
    data[file] = list(file_data)

with open('hindi_strings.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
