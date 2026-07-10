import re

with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update renderMatrimonial to include Status and Action buttons
old_render = '''        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${p.name || '-'}</strong></td>
            <td>${p.gender || '-'}</td>
            <td>${p.gotra || '-'}</td>
            <td>${p.mobile || '-'}</td>
            <td>
                ${photoBtn}
                <button onclick="viewMatrimonialDetails('${p.row}')" class="btn-primary btn-sm" title="View Details"><i class="fas fa-eye"></i></button>
            </td>
        `;'''

new_render = '''        const status = p.status || "Pending";
        let statusBadge = `<span class="badge" style="background-color: #ff9800; color: white;">Pending</span>`;
        if (status === "Approved") statusBadge = `<span class="badge" style="background-color: #4CAF50; color: white;">Approved</span>`;
        
        let approveBtn = '';
        if (status !== "Approved") {
            approveBtn = `<button onclick="approveMatrimonial('${p.row}')" class="btn-approve btn-sm" title="Approve"><i class="fas fa-check"></i></button>`;
        }
        
        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${p.name || '-'}</strong></td>
            <td>${p.gender || '-'}</td>
            <td>${p.gotra || '-'}</td>
            <td>${p.mobile || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                ${photoBtn}
                <button onclick="viewMatrimonialDetails('${p.row}')" class="btn-primary btn-sm" title="View Details"><i class="fas fa-eye"></i></button>
                ${approveBtn}
                <button onclick="deleteMatrimonial('${p.row}')" class="btn-danger btn-sm" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        `;'''

js = js.replace(old_render.strip(), new_render.strip())

# Add approveMatrimonial and deleteMatrimonial functions
new_functions = '''
function approveMatrimonial(rowNum) {
    if(!confirm("Are you sure you want to approve this profile? It will be publicly visible on the Matrimonial page.")) return;
    
    const tbody = document.getElementById('matrimonialTableBody');
    const originalHtml = tbody.innerHTML;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Approving Profile...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=approve_matrimonial&row=${rowNum}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success || data.status === "success") {
                Swal.fire("Success", "Profile has been approved!", "success");
                loadMatrimonial();
            } else {
                Swal.fire("Error", "Failed to approve: " + data.error, "error");
                tbody.innerHTML = originalHtml;
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "Network error occurred.", "error");
            tbody.innerHTML = originalHtml;
        });
}

function deleteMatrimonial(rowNum) {
    if(!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) return;
    
    const tbody = document.getElementById('matrimonialTableBody');
    const originalHtml = tbody.innerHTML;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Deleting Profile...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=delete_matrimonial&row=${rowNum}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success || data.status === "success") {
                Swal.fire("Deleted", "Profile has been deleted.", "success");
                loadMatrimonial();
            } else {
                Swal.fire("Error", "Failed to delete: " + data.error, "error");
                tbody.innerHTML = originalHtml;
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "Network error occurred.", "error");
            tbody.innerHTML = originalHtml;
        });
}
'''

if 'function approveMatrimonial' not in js:
    js += '\n' + new_functions

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
