import os

for root, _, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                target = '<li><a href="contact.html" class="nav-links "><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a></li>'
                target2 = '<li><a href="contact.html" class="nav-links active"><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a></li>'
                target3 = '<li><a href="contact.html" class="nav-links"><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a></li>'
                target4 = '<li><a href="contact.html"><span class="lang-hi">संपर्क</span><span class="lang-en">Contact</span></a></li>'
                
                new_link = '<li><a href="login.html" class="nav-links "><span class="lang-en">LOGIN</span><span class="lang-hi">लॉगिन</span></a></li>'
                new_link_footer = '<li><a href="login.html"><span class="lang-hi">लॉगिन</span><span class="lang-en">Login</span></a></li>'
                
                if target in content and 'login.html' not in content:
                    content = content.replace(target, target + '\n                        ' + new_link)
                elif target2 in content and 'login.html' not in content:
                    content = content.replace(target2, target2 + '\n                        ' + new_link)
                elif target3 in content and 'login.html' not in content:
                    content = content.replace(target3, target3 + '\n                        ' + new_link)
                
                # Also do the footer quick link
                if target4 in content and new_link_footer not in content:
                    content = content.replace(target4, target4 + '\n                        ' + new_link_footer)
                    
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f'Updated {path}')
            except Exception as e:
                print(f'Error in {path}: {e}')
