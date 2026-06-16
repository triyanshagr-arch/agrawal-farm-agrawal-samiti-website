import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Raj Kumar Gangal
content = re.sub(
    r'({\s*name_hi:\s*"राज कुमार गंगल",\s*name_en:\s*"Raj Kumar Gangal"[^}]+)(})',
    r'\1, img: "images/raj_kumar_gangal.jpg" \2',
    content
)

# Amit Kumar Garg
content = re.sub(
    r'({\s*name_hi:\s*"अमित कुमार गर्ग",\s*name_en:\s*"Amit Kumar Garg"[^}]+)(})',
    r'\1, img: "images/amit_kumar_garg.jpg" \2',
    content
)

# Alok Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"आलोक अग्रवाल",\s*name_en:\s*"Alok Agarwal"[^}]+)(})',
    r'\1, img: "images/alok_agarwal.jpg" \2',
    content
)

# Aditya Kumar Goyal
content = re.sub(
    r'({\s*name_hi:\s*"आदित्य कुमार गोयल",\s*name_en:\s*"Aditya Kumar Goyal"[^}]+)(})',
    r'\1, img: "images/aditya_kumar_goyal.jpg" \2',
    content
)

# Jitendra Kumar Gupta
content = re.sub(
    r'({\s*name_hi:\s*"जितेंद्र कुमार गुप्ता",\s*name_en:\s*"Jitendra Kumar Gupta"[^}]+)(})',
    r'\1, img: "images/jitendra_gupta.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 5.")
