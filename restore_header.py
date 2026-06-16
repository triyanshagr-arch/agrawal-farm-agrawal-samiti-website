import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# The current header text with language spans
current_header = '<span class="lang-hi">अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर (रजि.)</span><span class="lang-en" style="font-size: 0.85em; display:none;">Agrawal Samaj Samiti Agrawal Farm, Jaipur (Reg.)</span>'

# The original bilingual header text
original_header = 'अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर (रजि.)<br>\n                        <span style="font-size: 0.55em; letter-spacing: 1px; color: #555;">Agrawal Samaj Samiti Agrawal Farm, Jaipur (Reg.)</span>'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the toggling header with the fixed bilingual header
    if current_header in content:
        content = content.replace(current_header, original_header)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Header restored to bilingual successfully.")
