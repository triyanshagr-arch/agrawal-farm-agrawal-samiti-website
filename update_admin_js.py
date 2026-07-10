import re

with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add to the end of admin.js
matrimonial_code = '''
// ==========================================
// MATRIMONIAL MANAGEMENT LOGIC
// ==========================================

window.matrimonialData = [];

function loadMatrimonial() {
    const tbody = document.getElementById('matrimonialTableBody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading Profiles...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_matrimonial&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            if (data.profiles) {
                window.matrimonialData = data.profiles;
                renderMatrimonial();
                
                const statTotal = document.getElementById('statTotalMatrimonial');
                if(statTotal) statTotal.textContent = data.profiles.length;
            } else if (data.error) {
                Swal.fire("Failed to load profiles: " + data.error);
                if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center error-text">${data.error}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error loading matrimonial:', error);
            if(tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center error-text">Failed to load data. Please check console.</td></tr>';
        });
}

function renderMatrimonial() {
    const tbody = document.getElementById('matrimonialTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const profiles = window.matrimonialData || [];
    
    if (profiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No matrimonial profiles found.</td></tr>';
        return;
    }
    
    profiles.forEach(p => {
        const tr = document.createElement('tr');
        
        // Format date safely
        let dateStr = "Unknown";
        if (p.timestamp) {
            try {
                dateStr = new Date(p.timestamp).toLocaleDateString('en-IN');
            } catch(e) {}
        }
        
        let photoBtn = '';
        if(p.photo && p.photo.trim() !== '') {
            photoBtn = `<button onclick="viewMatrimonialPhoto('${p.row}')" class="btn-secondary btn-sm" title="View Photo"><i class="fas fa-image"></i></button>`;
        }
        
        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${p.name || '-'}</strong></td>
            <td>${p.gender || '-'}</td>
            <td>${p.gotra || '-'}</td>
            <td>${p.mobile || '-'}</td>
            <td>
                ${photoBtn}
                <button onclick="viewMatrimonialDetails('${p.row}')" class="btn-primary btn-sm" title="View Details"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewMatrimonialPhoto(rowNum) {
    const profiles = window.matrimonialData || [];
    const profile = profiles.find(p => p.row == rowNum);
    if(profile && profile.photo) {
        Swal.fire({
            title: profile.name + "'s Photo",
            imageUrl: profile.photo,
            imageAlt: 'Profile Photo',
            customClass: {
                popup: 'admin-modal'
            }
        });
    } else {
        Swal.fire("No photo available.");
    }
}

function viewMatrimonialDetails(rowNum) {
    const profiles = window.matrimonialData || [];
    const p = profiles.find(p => p.row == rowNum);
    if(!p) return;
    
    const details = `
        <div style="text-align: left; line-height: 1.6;">
            <p><strong>Name:</strong> ${p.name || '-'}</p>
            <p><strong>Gender:</strong> ${p.gender || '-'}</p>
            <p><strong>DOB:</strong> ${p.dob || '-'}</p>
            <p><strong>Height:</strong> ${p.height || '-'}</p>
            <p><strong>Gotra:</strong> ${p.gotra || '-'}</p>
            <p><strong>Manglik:</strong> ${p.manglik || '-'}</p>
            <p><strong>Education:</strong> ${p.education || '-'}</p>
            <p><strong>Profession:</strong> ${p.profession || '-'}</p>
            <p><strong>Income:</strong> ${p.income || '-'}</p>
            <p><strong>Father:</strong> ${p.father || '-'}</p>
            <p><strong>Mother:</strong> ${p.mother || '-'}</p>
            <p><strong>Address:</strong> ${p.address || '-'}</p>
            <p><strong>Mobile:</strong> ${p.mobile || '-'}</p>
        </div>
    `;
    
    Swal.fire({
        title: 'Matrimonial Profile Details',
        html: details,
        confirmButtonText: 'Close',
        customClass: {
            popup: 'admin-modal'
        }
    });
}

// Ensure loadMatrimonial is called when the tab is clicked
document.addEventListener('DOMContentLoaded', () => {
    // If we wanted to modify switchTab natively, but it's easier to just poll or hook into it.
    // We'll hook into switchTab by adding an event listener to the button
    const navMatrimonial = document.getElementById('nav-matrimonial');
    if(navMatrimonial) {
        navMatrimonial.addEventListener('click', () => {
            if(window.matrimonialData.length === 0) {
                loadMatrimonial();
            }
        });
    }
});
'''

# append if not exists
if 'MATRIMONIAL MANAGEMENT LOGIC' not in js:
    with open('admin.js', 'a', encoding='utf-8') as f:
        f.write('\\n' + matrimonial_code)
    print("Added matrimonial logic to admin.js")
else:
    print("Matrimonial logic already in admin.js")
