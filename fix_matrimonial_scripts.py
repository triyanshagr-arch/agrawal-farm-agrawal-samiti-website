import re

with open('matrimonial.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace everything from <!-- Firebase Analytics --> to </body> with clean imports

clean_footer_scripts = """    <!-- Firebase Analytics -->
    <script type="module" src="firebase_init.js"></script>

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script src="react.js?v=4"></script>
    <script src="submit_handler.js?v=4"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="pdf_generator.js?v=7"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            flatpickr(".datepicker", { dateFormat: "d/m/Y", allowInput: true });
        });
    </script>
</body>"""

content = re.sub(r'<!-- Firebase Analytics -->.*?</body>', clean_footer_scripts, content, flags=re.DOTALL)

with open('matrimonial.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed matrimonial.html scripts.")
