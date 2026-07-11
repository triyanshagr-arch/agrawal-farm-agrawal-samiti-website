import re

def update_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Add script to head if not present
    if 'recaptcha/api.js' not in html:
        html = html.replace('</head>', '    <script src="https://www.google.com/recaptcha/api.js" async defer></script>\n</head>')

    # 2. Add g-recaptcha div before submit buttons if not present
    recaptcha_div = '\n                <div class="g-recaptcha" data-sitekey="6LcNtE0tAAAAAK80jnRhwEaVLRAHjp0lmxtD4LKx" style="margin-bottom: 15px;"></div>\n                '
    
    # Use regex to find button type="submit" and insert before it
    # We only want to do this for the forms, not every button, but all type="submit" in these files are form buttons.
    # To be safe, let's just do a string replacement if we haven't already.
    if 'g-recaptcha' not in html:
        html = re.sub(r'(<button[^>]*type="submit"[^>]*>)', recaptcha_div + r'\1', html)

    # 3. Bump cache busters for JS files just in case
    html = re.sub(r'submit_handler\.js\?v=\d+', 'submit_handler.js?v=90', html)
    html = re.sub(r'matrimonial\.js\?v=\d+', 'matrimonial.js?v=90', html)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {filename}")

update_html('index.html')
update_html('matrimonial.html')
