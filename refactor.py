import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Dictionary of replacements for Nav Bar
nav_replacements = {
    '>HOME</a>': '><span class="lang-en">HOME</span><span class="lang-hi">होम</span></a>',
    '>ABOUT US</a>': '><span class="lang-en">ABOUT US</span><span class="lang-hi">हमारे बारे में</span></a>',
    '>NOTICES</a>': '><span class="lang-en">NOTICES</span><span class="lang-hi">सूचनाएँ</span></a>',
    '>ACTIVITIES</a>': '><span class="lang-en">ACTIVITIES</span><span class="lang-hi">गतिविधियाँ</span></a>',
    '>MEMBERS</a>': '><span class="lang-en">MEMBERS</span><span class="lang-hi">सदस्य</span></a>',
    '>CONTACT US</a>': '><span class="lang-en">CONTACT US</span><span class="lang-hi">संपर्क</span></a>',
    '>COMMITTEE</a>': '><span class="lang-en">COMMITTEE</span><span class="lang-hi">कार्यकारिणी</span></a>',
    '>GALLERY</a>': '><span class="lang-en">GALLERY</span><span class="lang-hi">गैलरी</span></a>'
}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add button to header-socials
    if 'id="lang-toggle"' not in content:
        content = content.replace(
            '<div class="header-socials">',
            '<div class="header-socials">\n                        <button id="lang-toggle" class="language-toggle"><i class="fas fa-language"></i> English</button>'
        )

    # 1. Main Header Title
    content = content.replace(
        'अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर (रजि.)<br>\n                        <span style="font-size: 0.55em; letter-spacing: 1px; color: #555;">Agrawal Samaj Samiti Agrawal Farm, Jaipur (Reg.)</span>',
        '<span class="lang-hi">अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर (रजि.)</span><span class="lang-en" style="font-size: 0.85em; display:none;">Agrawal Samaj Samiti Agrawal Farm, Jaipur (Reg.)</span>'
    )

    # 2. Section Titles pattern: <h2>Hindi <span>(English)</span></h2>
    content = re.sub(r'(<h[234][^>]*>)(.*?)\s*<span>\((.*?)\)</span>', r'\1<span class="lang-hi">\2</span><span class="lang-en">\3</span>', content)

    # 3. Footer Quick Links
    content = content.replace('होम (Home)', '<span class="lang-hi">होम</span><span class="lang-en">Home</span>')
    content = content.replace('हमारे बारे में (About)', '<span class="lang-hi">हमारे बारे में</span><span class="lang-en">About Us</span>')
    content = content.replace('कार्यकारिणी (Committee)', '<span class="lang-hi">कार्यकारिणी</span><span class="lang-en">Committee</span>')
    content = content.replace('सदस्य (Members)', '<span class="lang-hi">सदस्य</span><span class="lang-en">Members</span>')
    content = content.replace('सूचनाएँ (Notices)', '<span class="lang-hi">सूचनाएँ</span><span class="lang-en">Notices</span>')
    content = content.replace('गतिविधियाँ (Activities)', '<span class="lang-hi">गतिविधियाँ</span><span class="lang-en">Activities</span>')
    content = content.replace('गैलरी (Gallery)', '<span class="lang-hi">गैलरी</span><span class="lang-en">Gallery</span>')
    content = content.replace('संपर्क (Contact)', '<span class="lang-hi">संपर्क</span><span class="lang-en">Contact</span>')
    content = content.replace('त्वरित लिंक (Quick Links)', '<span class="lang-hi">त्वरित लिंक</span><span class="lang-en">Quick Links</span>')

    # 4. Nav Bar Links
    for orig, replacement in nav_replacements.items():
        content = content.replace(orig, replacement)
        
    # Some special cases for activity items where english is in parentheses
    content = content.replace('प्रतिवर्ष (Every Year)', '<span class="lang-hi">प्रतिवर्ष</span><span class="lang-en">Every Year</span>')
    content = content.replace('समय-समय पर (Periodically)', '<span class="lang-hi">समय-समय पर</span><span class="lang-en">Periodically</span>')
    content = content.replace('गतिविधियों की झलकियाँ (Activity Highlights)', '<span class="lang-hi">गतिविधियों की झलकियाँ</span><span class="lang-en">Activity Highlights</span>')
    
    # Gotra search placeholder
    content = content.replace('placeholder="गोत्र खोजें... (Search Gotra...)"', 'placeholder="गोत्र खोजें..." data-placeholder-hi="गोत्र खोजें..." data-placeholder-en="Search Gotra..." id="gotra-search-input"')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Processed {file}')
