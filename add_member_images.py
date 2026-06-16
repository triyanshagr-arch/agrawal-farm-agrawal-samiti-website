import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Krishnadeep Singhal
content = re.sub(
    r'({\s*name_hi:\s*"कृष्णदीप सिंघल",\s*name_en:\s*"Krishnadeep Singhal"[^}]+)(})',
    r'\1, img: "images/krishnadeep_singhal.jpg" \2',
    content
)

# 3. Banwari lal Gupta
content = re.sub(
    r'({\s*name_hi:\s*"बनवारी लाल गुप्ता",\s*name_en:\s*"Banwari Lal Gupta"[^}]+)(})',
    r'\1, img: "images/banwari_lal_gupta.jpg" \2',
    content
)

# 4. Brijmohan Goyal
content = re.sub(
    r'({\s*name_hi:\s*"बृजमोहन गोयल",\s*name_en:\s*"Brijmohan Goyal"[^}]+)(})',
    r'\1, img: "images/brijmohan_goyal.jpg" \2',
    content
)

# 5. Pushpa Mangal
content = re.sub(
    r'({\s*name_hi:\s*"पुष्पा मंगल",\s*name_en:\s*"Pushpa Mangal"[^}]+)(})',
    r'\1, img: "images/pushpa_mangal.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members.")
