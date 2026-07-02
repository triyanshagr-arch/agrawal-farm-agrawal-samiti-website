import glob
import re

html_files = glob.glob('*.html')

for file_path in html_files:
    if file_path == 'admin.html':
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the committee link from the footer
    content = re.sub(
        r'<li><a href="committee\.html"><span class="lang-hi">कार्यकारिणी</span><span class="lang-en">Committee</span></a></li>\s*',
        '',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Removed standalone committee links from footer!")
