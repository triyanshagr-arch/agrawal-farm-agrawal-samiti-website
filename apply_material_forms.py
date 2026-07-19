import os
import re

css_to_add = """
/* Material Design Form Styles */
.material-input-group {
    position: relative !important;
    border: 1px solid #d3d3d3 !important;
    border-radius: 6px !important;
    padding: 6px 12px 2px 12px !important;
    background-color: #f8f9fa !important;
    margin-bottom: 20px !important;
    transition: all 0.3s ease !important;
    box-sizing: border-box !important;
}

.material-input-group:focus-within {
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 1px var(--primary-color) !important;
    background-color: #fff !important;
}

.material-input-group label {
    display: block !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #888 !important;
    margin-bottom: 2px !important;
    font-family: inherit !important;
    line-height: 1.2 !important;
}

.material-input-group:focus-within label {
    color: var(--primary-color) !important;
}

.material-input-group input, 
.material-input-group select, 
.material-input-group textarea {
    width: 100% !important;
    border: none !important;
    outline: none !important;
    background: transparent !important;
    padding: 2px 0 6px 0 !important;
    font-size: 15px !important;
    color: #333 !important;
    box-shadow: none !important;
    height: auto !important;
}

/* Adjust layout for flex wrappers inside input groups */
.material-input-group > div {
    display: flex;
    gap: 10px;
    align-items: center;
}
"""

def append_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        content = f.read()
    if '.material-input-group' not in content:
        with open('style.css', 'a', encoding='utf-8') as f:
            f.write(css_to_add)
            print("Appended CSS to style.css")

def update_html_files():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        import bs4
        soup = bs4.BeautifulSoup(content, 'html.parser')
        form_groups = soup.find_all(class_='form-group')
        modified = False
        
        for group in form_groups:
            # Check if it has a radio or checkbox inside
            has_radio_or_checkbox = False
            for inp in group.find_all('input'):
                if inp.get('type') in ['radio', 'checkbox']:
                    has_radio_or_checkbox = True
                    break
            
            # If not, add the class
            if not has_radio_or_checkbox:
                classes = group.get('class', [])
                if 'material-input-group' not in classes:
                    classes.append('material-input-group')
                    group['class'] = classes
                    modified = True
                    
        if modified:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Updated {file}")

if __name__ == '__main__':
    append_css()
    update_html_files()
