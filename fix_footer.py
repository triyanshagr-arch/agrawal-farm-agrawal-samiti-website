import glob
import re

html_files = glob.glob('*.html')

for file_path in html_files:
    if file_path == 'admin.html':
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace:
    # <li><a href="sadasyata.html" class="nav-links "><span class="lang-en">MEMBERSHIP</span><span class="lang-hi">सदस्यता</span></a></li>
    # with:
    # <li><a href="sadasyata.html"><span class="lang-hi">सदस्यता</span><span class="lang-en">Membership</span></a></li>
    
    # <li><a href="donation.html" class="nav-links " style="color: #FFD700; font-weight: bold;"><span class="lang-en">DONATE</span><span class="lang-hi">दान करें</span></a></li>
    # with:
    # <li><a href="donation.html"><span class="lang-hi">दान करें</span><span class="lang-en">Donate</span></a></li>
    
    # <li><a href="booking.html" class="nav-links "><span class="lang-en">BOOKING</span><span class="lang-hi">बुकिंग</span></a></li>
    # with:
    # <li><a href="booking.html"><span class="lang-hi">बुकिंग</span><span class="lang-en">Booking</span></a></li>

    # Let's just use regex to target those specific lines.
    
    # For Membership
    content = re.sub(
        r'<li><a href="sadasyata\.html" class="nav-links ">\s*<span class="lang-en">MEMBERSHIP</span>\s*<span class="lang-hi">सदस्यता</span>\s*</a></li>',
        r'<li><a href="sadasyata.html"><span class="lang-hi">सदस्यता</span><span class="lang-en">Membership</span></a></li>',
        content
    )
    
    # For Donate
    content = re.sub(
        r'<li><a href="donation\.html" class="nav-links " style="color: #FFD700; font-weight: bold;">\s*<span class="lang-en">DONATE</span>\s*<span class="lang-hi">दान करें</span>\s*</a></li>',
        r'<li><a href="donation.html"><span class="lang-hi">दान करें</span><span class="lang-en">Donate</span></a></li>',
        content
    )
    
    # For Booking
    content = re.sub(
        r'<li><a href="booking\.html" class="nav-links ">\s*<span class="lang-en">BOOKING</span>\s*<span class="lang-hi">बुकिंग</span>\s*</a></li>',
        r'<li><a href="booking.html"><span class="lang-hi">बुकिंग</span><span class="lang-en">Booking</span></a></li>',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footer links fixed!")
