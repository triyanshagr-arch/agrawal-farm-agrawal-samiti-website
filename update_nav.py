import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        new_lines.append(line)
        if 'href="members.html"' in line and '<li' in line:
            indent = line[:line.find('<li')]
            new_lines.append(indent + '<li><a href="sadasyata.html" class="nav-links "><span class="lang-en">SADASYATA</span><span class="lang-hi">सदस्यता</span></a></li>')
            new_lines.append(indent + '<li><a href="donation.html" class="nav-links " style="color: #FFD700; font-weight: bold;"><span class="lang-en">DONATE</span><span class="lang-hi">दान करें</span></a></li>')
            
    with open(file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
        
print("Navbar updated in all files.")
