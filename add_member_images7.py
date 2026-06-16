import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Ajay Kumar Gupta
content = re.sub(
    r'({\s*name_hi:\s*"अजय कुमार गुप्ता",\s*name_en:\s*"Ajay Kumar Gupta"[^}]+)(})',
    r'\1, img: "images/ajay_kumar_gupta.jpg" \2',
    content
)

# Sunil Goyal
content = re.sub(
    r'({\s*name_hi:\s*"सुनील गोयल",\s*name_en:\s*"Sunil Goyal"[^}]+)(})',
    r'\1, img: "images/sunil_goyal.jpg" \2',
    content
)

# Ashok Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"अशोक अग्रवाल",\s*name_en:\s*"Ashok Agarwal"[^}]+)(})',
    r'\1, img: "images/ashok_agarwal.jpg" \2',
    content
)

# Prakash Chandra Singhal
content = re.sub(
    r'({\s*name_hi:\s*"प्रकाश चन्द्र सिंघल",\s*name_en:\s*"Prakash Chandra Singhal"[^}]+)(})',
    r'\1, img: "images/prakash_chandra_singhal.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 7.")
