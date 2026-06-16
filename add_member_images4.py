import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Vijay Kumar Gupta
content = re.sub(
    r'({\s*name_hi:\s*"विजय कुमार गुप्ता",\s*name_en:\s*"Vijay Kumar Gupta"[^}]+)(})',
    r'\1, img: "images/vijay_kumar_gupta.jpg" \2',
    content
)

# Naveen Chandra Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"नवीन चन्द्र अग्रवाल",\s*name_en:\s*"Naveen Chandra Agarwal"[^}]+)(})',
    r'\1, img: "images/naveen_chandra_agarwal.jpg" \2',
    content
)

# Rajkumar Gupta
content = re.sub(
    r'({\s*name_hi:\s*"राजकुमार गुप्ता",\s*name_en:\s*"Rajkumar Gupta"[^}]+)(})',
    r'\1, img: "images/rajkumar_gupta.jpg" \2',
    content
)

# Gopal Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"गोपाल अग्रवाल",\s*name_en:\s*"Gopal Agarwal"[^}]+)(})',
    r'\1, img: "images/gopal_agarwal.jpg" \2',
    content
)

# Rinku Kumar Mittal
content = re.sub(
    r'({\s*name_hi:\s*"रिंकू कुमार मित्तल",\s*name_en:\s*"Rinku Kumar Mittal"[^}]+)(})',
    r'\1, img: "images/rinku_kumar_mittal.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 4.")
