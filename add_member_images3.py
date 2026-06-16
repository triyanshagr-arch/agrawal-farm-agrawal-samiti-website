import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Dr. Praveen Manglunia
content = re.sub(
    r'({\s*name_hi:\s*"डॉ प्रवीण मंगलूनिया",\s*name_en:\s*"Dr\. Praveen Manglunia"[^}]+)(})',
    r'\1, img: "images/praveen_manglunia.jpg" \2',
    content
)

# Deepak Gupta
content = re.sub(
    r'({\s*name_hi:\s*"दीपक गुप्ता",\s*name_en:\s*"Deepak Gupta"[^}]+)(})',
    r'\1, img: "images/deepak_gupta.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 3.")
