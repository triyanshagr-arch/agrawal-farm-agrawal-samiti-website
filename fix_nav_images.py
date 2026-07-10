import os

with open("style.css", "a", encoding="utf-8") as f:
    f.write("""
/* Ensure navbar fits on 1024px to 1366px screens by shrinking the side images */
@media (min-width: 993px) and (max-width: 1350px) {
    .lakshmi-img { width: 150px; height: auto; margin-top: 10px; margin-right: -10px; }
    .agrasen-img { width: 100px; height: auto; margin-left: 0; margin-top: 10px; }
    .header-main-title { font-size: 1.2rem; }
    .header-content-box { max-width: 100%; margin: 0 160px; }
    
    .red-navbar { padding: 0 5px; }
    .red-navbar .nav-links { padding: 12px 3px; font-size: 0.7rem; }
    .red-navbar .nav-links .lang-hi { font-size: 0.85rem; }
    .language-toggle { padding: 4px 6px; font-size: 0.7rem; margin-left: 2px; }
}
""")

print("Appended image-shrinking media query.")
