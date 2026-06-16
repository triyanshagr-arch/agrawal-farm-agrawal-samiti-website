import re

with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Current block:
# .red-navbar .nav-links {
#     color: #fff;
#     text-decoration: none;
#     font-size: 0.85rem;
#     font-weight: 600;
#     padding: 12px 12px;
#     display: block;
#     transition: 0.3s;
#     text-transform: uppercase;
# }

target = """.red-navbar .nav-links {
    color: #fff;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 12px 12px;
    display: block;
    transition: 0.3s;
    text-transform: uppercase;
}"""

replacement = """.red-navbar .nav-links {
    color: #fff;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 12px 12px;
    display: block;
    transition: 0.3s;
    text-transform: uppercase;
}
.red-navbar .nav-links .lang-hi {
    font-size: 1.05rem;
}"""

# Normalizing line endings for the replacement
target = target.replace('\r', '')
replacement = replacement.replace('\r', '')
content = content.replace('\r', '')

if target in content:
    content = content.replace(target, replacement)
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: font size CSS added.")
else:
    print("Failed to find target block.")
