import re

with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the subject
js = js.replace('"Donation Receipt - Agrawal Samaj Samiti"', '"Donation Certificate - Agrawal Samaj Samiti"')

# Replace the body parts
js = js.replace('Donation Receipt (No: ${receiptNo})', 'Donation Certificate (No: ${receiptNo})')
js = js.replace('Best Regards,\\nAdmin Team\\nAgrawal Samaj Samiti', 'Best Regards, Admin Team Agrawal Samaj Samiti')

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Also bump cache buster in admin.html to v=82
with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('admin.js?v=81', 'admin.js?v=82')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done replacing.")
