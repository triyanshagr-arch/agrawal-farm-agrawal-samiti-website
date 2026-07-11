import glob
import re

old_header = r'<h1 class="header-main-title"[^>]*>\s*अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर \(रजि\.\)<br>\s*<span[^>]*>Agrawal Samaj Samiti Agrawal Farm, Jaipur \(Reg\.\)</span>\s*</h1>'

new_header = '''<h1 class="header-main-title" style="line-height: 1.2;">
                        <span class="lang-hi">अग्रवाल समाज समिति अग्रवाल फार्म, जयपुर (रजि.)</span><span class="lang-en">Agrawal Samaj Samiti Agrawal Farm, Jaipur (Reg.)</span><br>
                        <span style="font-size: 0.55em; letter-spacing: 1px; color: #555;" class="lang-hi">सुन्दर नगर - प्रथम, इस्कॉन रोड, जयपुर, राजस्थान - 302020</span><span style="font-size: 0.55em; letter-spacing: 1px; color: #555;" class="lang-en">Sundar Nagar - Pratham, ISKCON Road, Jaipur, Rajasthan - 302020</span>
                    </h1>'''

files = glob.glob('*.html')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    new_html = re.sub(old_header, new_header, html)
    if new_html != html:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated header in {file}")
