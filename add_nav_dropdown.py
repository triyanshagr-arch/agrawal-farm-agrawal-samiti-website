import glob
import re

# 1. Update style.css
css_addition = """
/* Nav Dropdown Desktop */
.nav-dropdown {
    position: relative;
}
.nav-dropdown-content {
    display: none;
    position: absolute;
    background-color: #FF6B00;
    min-width: 230px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1000;
    top: 100%;
    left: 0;
    padding: 0;
    list-style: none;
    border-radius: 4px;
    overflow: hidden;
    margin: 0;
}
.nav-dropdown:hover .nav-dropdown-content {
    display: block;
}
.nav-dropdown-link {
    color: white !important;
    padding: 12px 20px;
    text-decoration: none;
    display: block;
    font-size: 15px;
    font-weight: 500;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    transition: 0.2s;
}
.nav-dropdown-link:hover {
    background-color: #E65A00;
}
.nav-dropdown .dropbtn i {
    margin-left: 5px;
    font-size: 0.8em;
}

/* Nav Dropdown Mobile */
@media (max-width: 992px) {
    .nav-dropdown-content {
        position: static;
        box-shadow: none;
        background-color: rgba(0,0,0,0.1);
        padding-left: 0;
        display: none;
    }
    .nav-dropdown:hover .nav-dropdown-content,
    .nav-dropdown:active .nav-dropdown-content,
    .nav-dropdown:focus-within .nav-dropdown-content {
        display: block;
    }
    .nav-dropdown-link {
        border-bottom: none;
        padding: 10px 20px;
        text-align: center;
    }
}
"""

with open('style.css', 'r', encoding='utf-8') as f:
    style_content = f.read()

if 'Nav Dropdown Desktop' not in style_content:
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write("\n" + css_addition)

# 2. Update HTML files
html_files = glob.glob('*.html')
for file_path in html_files:
    if file_path == 'admin.html':
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace the existing members li
    # The existing line looks like: <li><a href="members.html" class="nav-links "><span class="lang-en">MEMBERS</span><span class="lang-hi">सदस्य</span></a></li>
    # It might have "active" in the class.
    
    is_active = False
    if file_path == 'members.html' or file_path == 'committee.html':
        is_active = True
        
    active_class = "active" if is_active else ""
    
    dropdown_html = f"""<li class="nav-dropdown">
                        <a href="javascript:void(0)" class="nav-links dropbtn {active_class}"><span class="lang-en">MEMBERS <i class="fas fa-caret-down"></i></span><span class="lang-hi">सदस्य <i class="fas fa-caret-down"></i></span></a>
                        <ul class="nav-dropdown-content">
                            <li><a href="committee.html" class="nav-dropdown-link"><span class="lang-en">Executive Committee</span><span class="lang-hi">कार्यकारिणी</span></a></li>
                            <li><a href="members.html" class="nav-dropdown-link"><span class="lang-en">Sector-wise Members</span><span class="lang-hi">सेक्टर सदस्य</span></a></li>
                        </ul>
                    </li>"""
    
    # Match the members li
    # <li><a href="members.html" class="nav-links active"><span class="lang-en">MEMBERS</span><span class="lang-hi">सदस्य</span></a></li>
    content = re.sub(
        r'<li><a href="members\.html" class="nav-links[^"]*"><span class="lang-en">MEMBERS</span><span class="lang-hi">सदस्य</span></a></li>',
        dropdown_html,
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Dropdown added!")
