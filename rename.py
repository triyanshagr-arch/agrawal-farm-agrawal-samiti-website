import os

for root, _, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # We need to replace MEMBERS with COMMITTEE and Members with Committee ONLY for the members.html links
                if '<span class="lang-en">MEMBERS</span>' in content or '<span class="lang-en">Members</span>' in content:
                    content = content.replace('<span class="lang-en">MEMBERS</span><span class="lang-hi">सदस्य</span></a>', '<span class="lang-en">COMMITTEE</span><span class="lang-hi">सदस्य</span></a>')
                    content = content.replace('<span class="lang-hi">सदस्य</span><span class="lang-en">Members</span></a>', '<span class="lang-hi">सदस्य</span><span class="lang-en\">Committee</span></a>')
                    
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(content)
                    print(f'Updated {path}')
            except Exception as e:
                print(f'Error in {path}: {e}')
