import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 6. Deoki Nandan Garg
content = re.sub(
    r'({\s*name_hi:\s*"देवकीनन्दन गर्ग",\s*name_en:\s*"Deoki Nandan Garg"[^}]+)(})',
    r'\1, img: "images/deoki_nandan_garg.jpg" \2',
    content
)

# 7. Kailash Gangal
content = re.sub(
    r'({\s*name_hi:\s*"कैलाश गंगल",\s*name_en:\s*"Kailash Gangal"[^}]+)(})',
    r'\1, img: "images/kailash_gangal.jpg" \2',
    content
)

# 8. Chandra Prakash Goyal
content = re.sub(
    r'({\s*name_hi:\s*"चन्द्र प्रकाश गोयल",\s*name_en:\s*"Chandra Prakash Goyal"[^}]+)(})',
    r'\1, img: "images/chandra_prakash_goyal.jpg" \2',
    content
)

# 9. Vijay Gupta
content = re.sub(
    r'({\s*name_hi:\s*"विजय गुप्ता",\s*name_en:\s*"Vijay Gupta"[^}]+)(})',
    r'\1, img: "images/vijay_gupta.jpg" \2',
    content
)

# 10. Govind Sharan Gupta
content = re.sub(
    r'({\s*name_hi:\s*"गोविन्द शरण गुप्ता",\s*name_en:\s*"Govind Sharan Gupta"[^}]+)(})',
    r'\1, img: "images/govind_sharan_gupta.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 2.")
