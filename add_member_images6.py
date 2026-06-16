import re

with open('react.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Sudhir Kumar Goyal
content = re.sub(
    r'({\s*name_hi:\s*"सुधीर कुमार गोयल",\s*name_en:\s*"Sudhir Kumar Goyal"[^}]+)(})',
    r'\1, img: "images/sudhir_kumar_goyal.jpg" \2',
    content
)

# Sudhir Kumar Singhal
content = re.sub(
    r'({\s*name_hi:\s*"सुधीर कुमार सिंघल",\s*name_en:\s*"Sudhir Kumar Singhal"[^}]+)(})',
    r'\1, img: "images/sudhir_singhal.jpg" \2',
    content
)

# Jay Prakash Kansal
content = re.sub(
    r'({\s*name_hi:\s*"जय प्रकाश कंसल",\s*name_en:\s*"Jay Prakash Kansal"[^}]+)(})',
    r'\1, img: "images/jay_prakash_kansal.jpg" \2',
    content
)

# Satish Chandra Agarwal
content = re.sub(
    r'({\s*name_hi:\s*"सतीश चंद्र अग्रवाल",\s*name_en:\s*"Satish Chandra Agarwal"[^}]+)(})',
    r'\1, img: "images/satish_agarwal.jpg" \2',
    content
)

# Anil Mangal
content = re.sub(
    r'({\s*name_hi:\s*"अनिल मंगल",\s*name_en:\s*"Anil Mangal"[^}]+)(})',
    r'\1, img: "images/anil_mangal.jpg" \2',
    content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Images attached to members batch 6.")
