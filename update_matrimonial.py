import re

with open('matrimonial.html', 'r', encoding='utf-8') as f:
    html = f.read()

gallery_section = '''
    <!-- APPROVED PROFILES GALLERY -->
    <section class="section" id="matrimonial-gallery-section" style="background-color: #f9f9f9; padding-bottom: 20px;">
        <div class="container">
            <h2 class="section-title text-center" style="margin-bottom: 30px;">Browse Profiles <span class="lang-hi" style="display:none;">(प्रोफाइल खोजें)</span></h2>
            
            <div id="matrimonialGalleryLoader" class="text-center" style="padding: 40px; font-size: 1.2rem; color: #666;">
                <i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Loading Profiles...
            </div>
            
            <div class="matrimonial-grid" id="matrimonialGallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; display: none;">
                <!-- Cards will be injected here -->
            </div>
            
            <hr style="margin-top: 50px; border-color: #e0e0e0;">
        </div>
    </section>
'''

if 'matrimonial-gallery-section' not in html:
    html = html.replace('<section class="section">', gallery_section + '\n    <section class="section">')

if 'matrimonial.js' not in html:
    html = html.replace('</body>', '    <script src="matrimonial.js"></script>\n</body>')

with open('matrimonial.html', 'w', encoding='utf-8') as f:
    f.write(html)
