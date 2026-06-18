import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace in navbar
    new_content = content.replace('<span class="lang-en">SADASYATA</span>', '<span class="lang-en">MEMBERSHIP</span>')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
print("Successfully changed SADASYATA to MEMBERSHIP in all files.")
