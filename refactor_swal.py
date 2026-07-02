import os

html_path = 'admin.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

if 'sweetalert2' not in html_content:
    # insert before </head>
    html_content = html_content.replace('</head>', '    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>\n</head>')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Added sweetalert2 to admin.html")

js_path = 'admin.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Make verifyDonation async
js_content = js_content.replace('function verifyDonation(rowNum)', 'async function verifyDonation(rowNum)')
js_content = js_content.replace('function actionBooking(rowNum, newStatus, email, fullName)', 'async function actionBooking(rowNum, newStatus, email, fullName)')

# Replace alert(...)
import re
js_content = re.sub(r'alert\((.*?)\);', r'Swal.fire(\1);', js_content)
js_content = re.sub(r'return alert\((.*?)\);', r'{ Swal.fire(\1); return; }', js_content)
js_content = re.sub(r'} else alert\((.*?)\);', r'} else { Swal.fire(\1); }', js_content)

# Special cases for alerts without semicolons at end of lines or in conditionals
js_content = js_content.replace('else { alert("Error: " + data.error); }', 'else { Swal.fire("Error: " + data.error); }')
js_content = js_content.replace('if (data.success) { alert("Notice Published Successfully!"); e.target.reset(); } ', 'if (data.success) { Swal.fire("Notice Published Successfully!"); e.target.reset(); } ')


with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
    print("Replaced alerts in admin.js")
