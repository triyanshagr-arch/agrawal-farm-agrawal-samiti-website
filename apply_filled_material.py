import os
import bs4
import re
import time

css_to_add = """
/* Material Design Filled Form Styles */
.material-filled-group {
    position: relative !important;
    background-color: #f0f2f5 !important;
    border-radius: 8px !important;
    padding: 8px 16px 4px 16px !important;
    margin-bottom: 20px !important;
    transition: background-color 0.2s ease, border-bottom-color 0.2s ease !important;
    box-sizing: border-box !important;
    border: none !important;
    border-bottom: 2px solid transparent !important;
}

.material-filled-group:focus-within {
    border-bottom: 2px solid var(--primary-color) !important;
    background-color: #e4e6eb !important;
}

.material-filled-group label {
    display: block !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #65676b !important;
    margin-bottom: 2px !important;
    font-family: inherit !important;
    line-height: 1.2 !important;
}

.material-filled-group:focus-within label {
    color: var(--primary-color) !important;
}

.material-filled-group input, 
.material-filled-group select, 
.material-filled-group textarea {
    width: 100% !important;
    border: none !important;
    outline: none !important;
    background: transparent !important;
    padding: 4px 0 4px 0 !important;
    font-size: 15px !important;
    color: #050505 !important;
    box-shadow: none !important;
    height: auto !important;
}

/* Fix flex child layout inside groups */
.material-filled-group > div {
    display: flex;
    gap: 15px;
    align-items: center;
}
"""

def append_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    if '.material-filled-group' not in content:
        with open('style.css', 'a', encoding='utf-8') as f:
            f.write(css_to_add)
            print("Appended CSS to style.css")

def update_html_files():
    # Cache buster version based on timestamp
    new_version = str(int(time.time()))
    
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update style.css cache buster
        content = re.sub(r'href="style\.css\?v=[0-9]+"', f'href="style.css?v={new_version}"', content)
        content = re.sub(r'href="style\.css"', f'href="style.css?v={new_version}"', content)

        soup = bs4.BeautifulSoup(content, 'html.parser')
        form_groups = soup.find_all(class_='form-group')
        modified = True # we always modify to update cache buster
        
        for group in form_groups:
            # Check if it has a radio or checkbox inside
            has_radio_or_checkbox = False
            for inp in group.find_all('input'):
                if inp.get('type') in ['radio', 'checkbox', 'hidden', 'submit', 'button', 'file', 'color']:
                    has_radio_or_checkbox = True
                    break
            
            # If not, add the class
            if not has_radio_or_checkbox:
                classes = group.get('class', [])
                if 'material-filled-group' not in classes:
                    classes.append('material-filled-group')
                    group['class'] = classes
                    
        if modified:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Updated {file} (added classes and updated CSS version)")

if __name__ == '__main__':
    append_css()
    update_html_files()
