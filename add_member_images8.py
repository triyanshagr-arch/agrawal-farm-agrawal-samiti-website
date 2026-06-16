import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Laxmi Narayan Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"लक्ष्मी नारायण अग्रवाल",\s*name_en:\s*"Laxmi Narayan Agarwal"[^}]+)(})',
    r'\1, img: "images/laxmi_narayan_agarwal.jpg" \2',
    content
)

# Balkrishna Garg
content = re.sub(
    r'({\s*name_hi:\s*"बालकृष्ण गर्ग",\s*name_en:\s*"Balkrishna Garg"[^}]+)(})',
    r'\1, img: "images/balkrishna_garg.jpg" \2',
    content
)

# Pawan Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"पवन अग्रवाल",\s*name_en:\s*"Pawan Agarwal"[^}]+)(})',
    r'\1, img: "images/pawan_agarwal.jpg" \2',
    content
)

# Satish Garg
content = re.sub(
    r'({\s*name_hi:\s*"सतीश गर्ग",\s*name_en:\s*"Satish Garg"[^}]+)(})',
    r'\1, img: "images/satish_garg.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 8.")
