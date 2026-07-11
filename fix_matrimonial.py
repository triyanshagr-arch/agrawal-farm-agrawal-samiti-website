import re
with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find everything between <section id="tab-matrimonial" and </section> for matrimonial
pattern = r'<section id="tab-matrimonial" class="tab-content".*?</section>'
match = re.search(pattern, html, flags=re.DOTALL)
if match:
    new_section = '''<section id="tab-matrimonial" class="tab-content" style="display: none;">
                <div class="header-bar">
                    <h2>Matrimonial Profiles</h2>
                    <button onclick="loadMatrimonial()" class="btn-secondary"><i class="fas fa-sync"></i> Refresh</button>
                </div>
                
                <div class="search-bar">
                    <input type="text" id="searchMatrimonial" placeholder="Search by Name, Mobile, or Gotra..." onkeyup="filterTable('matrimonialTableBody', 'searchMatrimonial')">
                </div>
                
                <div class="table-container">
                    <table id="matrimonialTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Gotra</th>
                                <th>Mobile</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="matrimonialTableBody">
                            <tr><td colspan="7" class="text-center">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>'''
    
    html = html.replace(match.group(0), new_section)
    # update cache buster
    html = html.replace('admin.js?v=79', 'admin.js?v=80')
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Successfully replaced tab-matrimonial')
else:
    print('Could not find tab-matrimonial pattern')
