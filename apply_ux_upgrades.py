import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# Dark mode toggle HTML
toggle_html = '''
                        <li class="theme-toggle-li">
                            <button id="themeToggle" style="padding: 5px 10px; margin-left: 10px; font-size: 1.2rem; background: transparent; border: none; cursor: pointer; color: var(--primary-color);" title="Toggle Dark Mode">
                                <i class="fas fa-moon"></i>
                            </button>
                        </li>
                        <li>
                            <button id="langToggle"'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Inject Dark Mode toggle if not present
    if 'id="themeToggle"' not in content:
        # We replace the start of the langToggle list item
        if '<li>\n                            <button id="langToggle"' in content:
            content = content.replace('<li>\n                            <button id="langToggle"', toggle_html)
            modified = True
        elif '<li>\n                        <button id="langToggle"' in content:
            content = content.replace('<li>\n                        <button id="langToggle"', toggle_html)
            modified = True
        elif '<li><button id="langToggle"' in content:
            content = content.replace('<li><button id="langToggle"', toggle_html.replace('\n                            ', ''))
            modified = True

    # Inject animate-on-scroll classes
    targets = [
        ('class="card"', 'class="card animate-on-scroll"'),
        ('class="card "', 'class="card animate-on-scroll "'),
        ('class="section-title"', 'class="section-title animate-on-scroll"'),
        ('class="hero-content"', 'class="hero-content animate-on-scroll"'),
        ('class="gallery-item"', 'class="gallery-item animate-on-scroll"'),
        ('class="member-card"', 'class="member-card animate-on-scroll"'),
        ('class="about-content"', 'class="about-content animate-on-scroll"')
    ]
    
    for old, new in targets:
        if old in content and 'animate-on-scroll' not in old:
            content = content.replace(old, new)
            modified = True
            
    # Remove duplicates just in case
    content = content.replace('animate-on-scroll animate-on-scroll', 'animate-on-scroll')

    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

print("UX modifications applied successfully.")
