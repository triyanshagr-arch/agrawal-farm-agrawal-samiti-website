import glob

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    
    changed = False

    # Check header nav
    if 'href="booking.html"' not in html and 'href="contact.html"' in html:
        nav_insert = '<li><a href="booking.html" class="nav-links "><span class="lang-en">BOOKING</span><span class="lang-hi">बुकिंग</span></a></li>\n                        <li><a href="contact.html" class="nav-links "><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a></li>'
        html = html.replace('<li><a href="contact.html" class="nav-links "><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a></li>', nav_insert)
        changed = True

    # Check footer nav
    # The footer might not exist in all files, but let's check
    if 'href="booking.html"' not in html and 'href="contact.html"' in html:
        # If still missing booking.html, it means it was only missing in footer or something
        pass
        
    if changed:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Fixed nav in {filename}")

files = glob.glob('*.html')
for file in files:
    if file != 'admin.html': # Admin dashboard doesn't have the normal nav
        fix_file(file)
