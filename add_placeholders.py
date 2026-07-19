import os
import bs4
import re

def remove_material_css():
    try:
        with open('style.css', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the block we added
        marker = "/* Material Design Form Styles */"
        if marker in content:
            content = content.split(marker)[0]
            with open('style.css', 'w', encoding='utf-8') as f:
                f.write(content.strip() + "\n")
            print("Reverted style.css")
    except Exception as e:
        print("Error reverting CSS:", e)

def clean_text(text):
    if not text:
        return ""
    # Remove asterisks and extra spaces
    text = text.replace('*', '').strip()
    return text

def process_html_files():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        soup = bs4.BeautifulSoup(content, 'html.parser')
        modified = False
        
        # 1. Revert the material class
        for group in soup.find_all(class_='material-input-group'):
            classes = group.get('class', [])
            if 'material-input-group' in classes:
                classes.remove('material-input-group')
                group['class'] = classes
                modified = True
                
        # 2. Add placeholders
        for group in soup.find_all(class_='form-group'):
            label = group.find('label')
            if not label:
                continue
                
            en_text = ""
            hi_text = ""
            
            span_en = label.find(class_='lang-en')
            span_hi = label.find(class_='lang-hi')
            
            if span_en and span_hi:
                en_text = clean_text(span_en.get_text())
                hi_text = clean_text(span_hi.get_text())
            else:
                # Just use the raw text if no translation spans
                text = clean_text(label.get_text())
                en_text = text
                hi_text = text
                
            if not en_text:
                continue
                
            # Find inputs
            for inp in group.find_all(['input', 'textarea']):
                # Skip radio, checkbox, hidden, date (date sometimes has its own placeholder behavior, but let's allow date if the user wants it, wait dates don't use standard placeholders well in all browsers. Let's apply it anyway)
                if inp.name == 'input' and inp.get('type') in ['radio', 'checkbox', 'hidden', 'submit', 'button', 'file', 'color']:
                    continue
                    
                # If it already has a placeholder, maybe don't overwrite if it's explicitly set?
                # Actually, let's overwrite to ensure consistency, but only if it's empty or we want to standardize.
                # Let's just set it.
                inp['placeholder'] = f"Enter {en_text}" if not en_text.lower().startswith('enter') else en_text
                
                # If they have lang spans, add data attributes for translation
                if span_en and span_hi:
                    inp['data-placeholder-en'] = f"Enter {en_text}" if not en_text.lower().startswith('enter') else en_text
                    inp['data-placeholder-hi'] = f"{hi_text} दर्ज करें" if "दर्ज" not in hi_text else hi_text
                    
                modified = True
                
        if modified:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print(f"Added placeholders to {file}")

if __name__ == '__main__':
    remove_material_css()
    process_html_files()
