import re

# Update admin.html
with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

nav_link = '<li><a href="#" onclick="switchTab(\\\'expenses\\\', this)"><i class="fas fa-wallet"></i> Expense Manager</a></li>\n                <li><a href="#" onclick="switchTab(\\\'matrimonial\\\', this)"><i class="fas fa-heart"></i> Matrimonial</a></li>'
html = html.replace('<li><a href="#" onclick="switchTab(\\\'expenses\\\', this)"><i class="fas fa-wallet"></i> Expense Manager</a></li>', nav_link)

tab_content = '''
            <!-- MATRIMONIAL SECTION -->
            <section id="tab-matrimonial" class="tab-content" style="display: none;">
                <div class="tab-header">
                    <h2><i class="fas fa-heart"></i> Matrimonial Profiles</h2>
                    <div class="header-actions">
                        <button onclick="loadMatrimonial()" class="btn-refresh"><i class="fas fa-sync-alt"></i> Refresh</button>
                    </div>
                </div>

                <div class="admin-card">
                    <div class="stats-container" id="statsMatrimonialContainer" style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <div class="stat-box">
                            <div class="stat-icon" style="background: rgba(211, 47, 47, 0.1); color: #D32F2F;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <span>Total Profiles</span>
                                <h3 id="statTotalMatrimonial">0</h3>
                            </div>
                        </div>
                    </div>

                    <input type="text" id="searchMatrimonial" placeholder="Search by Name, Mobile, or Gotra..." onkeyup="filterTable('matrimonialTableBody', 'searchMatrimonial')">
                    
                    <div class="table-responsive">
                    <table id="matrimonialTable">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Gotra</th>
                                <th>Mobile</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="matrimonialTableBody">
                            <!-- Matrimonial rows will be loaded here -->
                        </tbody>
                    </table>
                    </div>
                </div>
            </section>
'''
html = html.replace('        </main>', tab_content + '\n        </main>')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated admin.html')
