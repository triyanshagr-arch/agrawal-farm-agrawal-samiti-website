import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # We want to add Matrimonial right after Membership
    if 'href="matrimonial.html"' not in content:
        if '<li><a href="sadasyata.html" class="nav-links "><span class="lang-en">MEMBERSHIP</span><span class="lang-hi">सदस्यता</span></a></li>' in content:
            content = content.replace(
                '<li><a href="sadasyata.html" class="nav-links "><span class="lang-en">MEMBERSHIP</span><span class="lang-hi">सदस्यता</span></a></li>',
                '<li><a href="sadasyata.html" class="nav-links "><span class="lang-en">MEMBERSHIP</span><span class="lang-hi">सदस्यता</span></a></li>\n                        <li><a href="matrimonial.html" class="nav-links "><span class="lang-en">MATRIMONIAL</span><span class="lang-hi">वैवाहिक</span></a></li>'
            )
            modified = True
        elif 'href="sadasyata.html"' in content:
            # Fallback regex just in case
            content = re.sub(
                r'(<li><a href="sadasyata\.html".*?</a></li>)',
                r'\1\n                        <li><a href="matrimonial.html" class="nav-links "><span class="lang-en">MATRIMONIAL</span><span class="lang-hi">वैवाहिक</span></a></li>',
                content, count=1
            )
            modified = True
            
    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added Matrimonial nav to {file}")

print("Navbar updated in all files.")
