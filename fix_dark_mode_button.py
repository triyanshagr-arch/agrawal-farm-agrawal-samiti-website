import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Dark mode toggle HTML
toggle_html = '''
                    <li class="theme-toggle-li nav-item-toggle">
                        <button id="themeToggle" class="language-toggle" style="padding: 5px 10px; margin-left: 10px; font-size: 1.2rem; background: transparent; border: none; cursor: pointer; color: white;" title="Toggle Dark Mode">
                            <i class="fas fa-moon"></i>
                        </button>
                    </li>
                    <li class="nav-item-toggle">
                        <button id="lang-toggle"'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if 'id="themeToggle"' not in content:
        # Search for lang-toggle
        if '<li class="nav-item-toggle">\n                        <button id="lang-toggle"' in content:
            content = content.replace('<li class="nav-item-toggle">\n                        <button id="lang-toggle"', toggle_html)
            modified = True
        elif '<li class="nav-item-toggle"><button id="lang-toggle"' in content:
            content = content.replace('<li class="nav-item-toggle"><button id="lang-toggle"', toggle_html)
            modified = True
        elif '<li class="nav-item-toggle">\n                        <button id="lang-toggle"' in content:
             content = content.replace('<li class="nav-item-toggle">\n                        <button id="lang-toggle"', toggle_html)
             modified = True

    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected Dark Mode button in {file}")

print("Fix completed.")
