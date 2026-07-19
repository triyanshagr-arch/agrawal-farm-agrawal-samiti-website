import re
import time
import os

def fix_navbar_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix width of red-navbar
    content = re.sub(r'width:\s*104%;', 'width: 100%; max-width: 1200px;', content)
    
    # 2. Fix nav-menu wrap
    content = re.sub(r'flex-wrap:\s*nowrap;', 'flex-wrap: wrap;', content)
    
    # 3. Reduce padding on nav-links
    # There are multiple occurrences, let's target the one around line 2305 with !important
    content = re.sub(r'padding:\s*12px 20px\s*!important;', 'padding: 10px 10px !important;', content)
    content = re.sub(r'padding:\s*12px 6px;', 'padding: 10px 8px;', content)
    
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed style.css")

def update_html_cache():
    new_version = str(int(time.time()))
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'href="style\.css\?v=[0-9]+"', f'href="style.css?v={new_version}"', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
    print("Updated HTML cache busters")

if __name__ == '__main__':
    fix_navbar_css()
    update_html_cache()
