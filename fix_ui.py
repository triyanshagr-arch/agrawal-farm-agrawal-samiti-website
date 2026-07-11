import os

# 1. FIX admin.html
with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix Refresh button
html = html.replace('class="btn-refresh"><i class="fas fa-sync-alt"></i> Refresh', 'class="btn-secondary"><i class="fas fa-sync"></i> Refresh')

# Fix Stats Container
old_stats = '''<div class="stats-container" id="statsMatrimonialContainer" style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div class="stat-card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); flex: 1; text-align: center;">
                                    <div class="icon" style="background-color: #ffebee; color: #d32f2f; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 24px;">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <h3 id="statTotalMatrimonial">0</h3>
                                    <p style="color: #666; margin: 0;">Total Profiles</p>
                                </div>
                            </div>'''

new_stats = '''<div class="stats-container" id="statsMatrimonialContainer" style="display: flex;">
                                <div class="stat-card">
                                    <div class="stat-icon" style="background: #ffebee; color: #d32f2f;"><i class="fas fa-users"></i></div>
                                    <div class="stat-info">
                                        <h3 id="statTotalMatrimonial">0</h3>
                                        <p>Total Profiles</p>
                                    </div>
                                </div>
                            </div>'''

if old_stats in html:
    html = html.replace(old_stats, new_stats)
else:
    # try generic replace if whitespace differs
    pass 

# Fix Search Box
old_search = '''<input type="text" id="searchMatrimonial" placeholder="Search by Name, Mobile, or Gotra..." onkeyup="filterTable('matrimonialTableBody', 'searchMatrimonial')">'''
new_search = '''<div class="action-bar" style="margin-top: 20px; display: flex; gap: 10px;">
                                <div class="search-box" style="flex: 1;">
                                    <input type="text" id="searchMatrimonial" placeholder="Search by Name, Mobile, or Gotra..." onkeyup="filterTable('matrimonialTableBody', 'searchMatrimonial')">
                                </div>
                            </div>'''
if old_search in html:
    html = html.replace(old_search, new_search)

# Increment cache buster just in case
html = html.replace('admin.js?v=78', 'admin.js?v=79')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. FIX admin.js
with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_actions = '''<td>
                ${photoBtn}
                <button onclick="viewMatrimonialDetails('${p.row}')" class="btn-primary btn-sm" title="View Details"><i class="fas fa-eye"></i></button>
                ${approveBtn}
                <button onclick="deleteMatrimonial('${p.row}')" class="btn-danger btn-sm" title="Delete"><i class="fas fa-trash"></i></button>
            </td>'''

# Use inline styles or defined classes for small action buttons to prevent them from taking 100% width
new_actions = '''<td style="white-space: nowrap;">
                ${photoBtn}
                <button onclick="viewMatrimonialDetails('${p.row}')" style="background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;" title="View Details"><i class="fas fa-eye"></i></button>
                ${approveBtn}
                <button onclick="deleteMatrimonial('${p.row}')" style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;" title="Delete"><i class="fas fa-trash"></i></button>
            </td>'''

# Also update photoBtn in admin.js to match size
js = js.replace('class="btn-secondary btn-sm"', 'style="background: #fff; color: #d32f2f; border: 1px solid #d32f2f; padding: 5px 11px; border-radius: 4px; cursor: pointer; margin-right: 5px;"')

if old_actions in js:
    js = js.replace(old_actions, new_actions)
else:
    # Try a regex if exact match fails
    import re
    js = re.sub(r'<td>\s*\$\{photoBtn\}\s*<button onclick="viewMatrimonialDetails.*?</td>', new_actions, js, flags=re.DOTALL)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("UI fixes applied")
