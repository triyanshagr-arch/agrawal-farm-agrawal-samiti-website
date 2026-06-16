import re

# 1. Fix about.html gotra items
with open('about.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace: <li data-gotra="गर्ग (Garg)" style="...">गर्ग<br><span style="..."> (Garg)</span></li>
# with: <li data-gotra="गर्ग (Garg)" style="..."><span class="lang-hi">गर्ग</span><span class="lang-en">Garg</span></li>
# Since the style is exactly the same, let's use a regex to capture it.
content = re.sub(
    r'<li data-gotra="([^"]+)\s\(([^)]+)\)"([^>]*)>.*?</style>.*?</li>',
    r'<li data-gotra="\1 (\2)"\3><span class="lang-hi">\1</span><span class="lang-en">\2</span></li>',
    content,
    flags=re.DOTALL
)

# A more robust regex:
content = re.sub(
    r'<li data-gotra="([^"]+?)\s*\(([^)]+)\)"([^>]*)>\s*.*?(?:<br>|<span>).*?</li>',
    r'<li data-gotra="\1 (\2)"\3><span class="lang-hi">\1</span><span class="lang-en">\2</span></li>',
    content,
    flags=re.DOTALL
)

with open('about.html', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Fix react.js gotra dictionary
with open('react.js', 'r', encoding='utf-8') as f:
    react_content = f.read()

# We need to change: "text <br><br><span class=\"en-text\">english text</span>"
# To: "<span class=\"lang-hi\">text</span><span class=\"lang-en\">english text</span>"
react_content = re.sub(
    r'"([^"]+?)(?:<br>|<br\s*/>)*\s*<span class=\\"en-text\\">([^<]+)</span>"',
    r'"<span class=\\"lang-hi\\">\1</span><span class=\\"lang-en\\">\2</span>"',
    react_content
)

# And for the roles in the committee section inside react.js, if any
react_content = re.sub(
    r'role: "([^"]+?)\s*\(([^)]+)\)"',
    r'role: "<span class=\\"lang-hi\\">\1</span><span class=\\"lang-en\\">\2</span>"',
    react_content
)

with open('react.js', 'w', encoding='utf-8') as f:
    f.write(react_content)

print("Done fixing gotras.")
