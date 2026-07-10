import os

with open("style.css", "a", encoding="utf-8") as f:
    f.write("""
/* Squeeze navbar on smaller laptops so it stays on one line */
@media (min-width: 993px) and (max-width: 1200px) {
    .red-navbar { padding: 0 10px; margin-top: 5px; }
    .red-navbar .nav-links { padding: 12px 3px; font-size: 0.7rem; }
    .red-navbar .nav-links .lang-hi { font-size: 0.85rem; }
    .language-toggle { padding: 4px 8px; font-size: 0.75rem; margin-left: 2px; }
}
""")

print("Appended media query successfully.")
