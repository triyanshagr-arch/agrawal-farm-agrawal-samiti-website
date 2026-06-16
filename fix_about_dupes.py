import re

with open('about.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Mission
content = content.replace(
    '<h3>हमारा मिशन <span class="en-sub">(Our Mission)</span></h3>\n                        <p class="hi-text"><span class="lang-hi">समाज के सभी वर्गों की सेवा एवं उत्थान।</span><span class="lang-en">Service and upliftment of all sections of the society.</span></p>\n                        <p class="en-text">We strive to serve and uplift all sections of our community.</p>',
    '<h3><span class="lang-hi">हमारा मिशन</span><span class="lang-en">Our Mission</span></h3>\n                        <p><span class="lang-hi">समाज के सभी वर्गों की सेवा एवं उत्थान।</span><span class="lang-en">We strive to serve and uplift all sections of our community.</span></p>'
)

# 2. Vision
content = content.replace(
    '<h3>हमारा विजन <span class="en-sub">(Our Vision)</span></h3>\n                        <p class="hi-text"><span class="lang-hi">एकजुट, समृद्ध और सुसंस्कृत अग्रवाल समाज।</span><span class="lang-en">A united, prosperous, and cultured Agrawal community.</span></p>\n                        <p class="en-text">A united, prosperous, and cultured Agrawal society.</p>',
    '<h3><span class="lang-hi">हमारा विजन</span><span class="lang-en">Our Vision</span></h3>\n                        <p><span class="lang-hi">एकजुट, समृद्ध और सुसंस्कृत अग्रवाल समाज।</span><span class="lang-en">A united, prosperous, and cultured Agrawal society.</span></p>'
)

# 3. Founded
content = content.replace(
    '<div class="founded-text">\n                            <p class="hi-text"><strong><span class="lang-hi">स्थापना:</span><span class="lang-en">Established:</span></strong> हमारी समिति दशकों से समाज के उत्थान के लिए समर्पित है।</p>\n                            <p class="en-text"><strong>Founded:</strong> Our committee has been dedicated to the upliftment of society for decades.</p>\n                        </div>',
    '<div class="founded-text">\n                            <p><strong><span class="lang-hi">स्थापना:</span><span class="lang-en">Founded:</span></strong> <span class="lang-hi">हमारी समिति दशकों से समाज के उत्थान के लिए समर्पित है।</span><span class="lang-en">Our committee has been dedicated to the upliftment of society for decades.</span></p>\n                        </div>'
)

# 4. Cards
content = content.replace(
    '<h4><span class="lang-hi">सामाजिक सेवा</span><span class="lang-en">Social Service</span></h4>\n                        <p>Social Service</p>',
    '<h4><span class="lang-hi">सामाजिक सेवा</span><span class="lang-en">Social Service</span></h4>'
)

content = content.replace(
    '<h4><span class="lang-hi">सांस्कृतिक कार्यक्रम</span><span class="lang-en">Cultural Evening</span></h4>\n                        <p>Cultural Programs</p>',
    '<h4><span class="lang-hi">सांस्कृतिक कार्यक्रम</span><span class="lang-en">Cultural Programs</span></h4>'
)
content = content.replace(
    '<h4>सांस्कृतिक कार्यक्रम</h4>\n                        <p>Cultural Programs</p>',
    '<h4><span class="lang-hi">सांस्कृतिक कार्यक्रम</span><span class="lang-en">Cultural Programs</span></h4>'
)

content = content.replace(
    '<h4><span class="lang-hi">सदस्य सहयोग</span><span class="lang-en">Member Support</span></h4>\n                        <p>Member Support</p>',
    '<h4><span class="lang-hi">सदस्य सहयोग</span><span class="lang-en">Member Support</span></h4>'
)

with open('about.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("about.html duplicates fixed.")
