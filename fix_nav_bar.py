import glob
import re

html_files = glob.glob('*.html')

for file_path in html_files:
    if file_path == 'admin.html':
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine which one is active
    sadasyata_class = 'nav-links active' if file_path == 'sadasyata.html' else 'nav-links '
    donation_class = 'nav-links active' if file_path == 'donation.html' else 'nav-links '
    booking_class = 'nav-links active' if file_path == 'booking.html' else 'nav-links '

    # Replace sadasyata link in the nav bar specifically (not footer). 
    # The nav bar links are within <nav ...> ... </nav> or <ul class="nav-menu">
    # Let's just do a broad replacement but be careful not to mess up footer if they are same.
    # The footer links usually don't have class="nav-links"
    
    # We will find the ul.nav-menu block and replace inside it.
    match = re.search(r'<ul class="nav-menu">(.*?)</ul>', content, re.DOTALL)
    if match:
        nav_menu = match.group(1)
        
        # Replace sadasyata.html
        nav_menu = re.sub(
            r'<li><a href="sadasyata\.html".*?</a></li>',
            f'<li><a href="sadasyata.html" class="{sadasyata_class}"><span class="lang-en">MEMBERSHIP</span><span class="lang-hi">सदस्यता</span></a></li>',
            nav_menu
        )
        
        # Replace donation.html
        nav_menu = re.sub(
            r'<li><a href="donation\.html".*?</a></li>',
            f'<li><a href="donation.html" class="{donation_class}"><span class="lang-en">DONATE</span><span class="lang-hi">दान करें</span></a></li>',
            nav_menu
        )
        
        # Replace booking.html
        nav_menu = re.sub(
            r'<li><a href="booking\.html".*?</a></li>',
            f'<li><a href="booking.html" class="{booking_class}"><span class="lang-en">BOOKING</span><span class="lang-hi">बुकिंग</span></a></li>',
            nav_menu
        )
        
        new_content = content[:match.start(1)] + nav_menu + content[match.end(1):]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("Nav bar links fixed!")
