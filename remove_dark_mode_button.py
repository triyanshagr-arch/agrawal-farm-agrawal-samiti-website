import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Dark mode toggle HTML
toggle_html = '''                    <li class="theme-toggle-li nav-item-toggle">
                        <button id="themeToggle" class="language-toggle" style="padding: 5px 10px; margin-left: 10px; font-size: 1.2rem; background: transparent; border: none; cursor: pointer; color: white;" title="Toggle Dark Mode">
                            <i class="fas fa-moon"></i>
                        </button>
                    </li>
'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if toggle_html in content:
        content = content.replace(toggle_html, '')
        modified = True

    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed Dark Mode button from {file}")

print("Removal completed.")
