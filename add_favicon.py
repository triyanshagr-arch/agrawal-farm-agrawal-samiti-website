import os
import glob

favicon_tag = """
    <!-- Favicon -->
    <link rel="icon" href="images/maharaj_agrasen.png" type="image/png">"""

for html_file in glob.glob("*.html"):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "rel=\"icon\"" not in content:
        # insert right after </title>
        content = content.replace("</title>", "</title>" + favicon_tag)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added favicon to {html_file}")
    else:
        print(f"Favicon already exists in {html_file}")
