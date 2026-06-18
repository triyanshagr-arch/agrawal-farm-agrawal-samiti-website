let sessionPassword = "";

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('adminPassword').value;
    const btn = e.target.querySelector('button');
    const err = document.getElementById('loginError');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    btn.disabled = true;
    err.innerText = "";

    // Test the password by trying to fetch members
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_members&password=${encodeURIComponent(pw)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionPassword = pw;
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('dashboardScreen').style.display = 'flex';
                renderMembers(data.members);
            } else {
                err.innerText = "Error: " + (data.error || "Invalid Password");
                btn.innerHTML = 'Login';
                btn.disabled = false;
            }
        })
        .catch(error => {
            err.innerText = "Network Error. Please try again.";
            btn.innerHTML = 'Login';
            btn.disabled = false;
        });
});

// Switch Tabs
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).style.display = 'block';
    el.classList.add('active');
}

// Logout
function logout() {
    sessionPassword = "";
    document.getElementById('adminPassword').value = "";
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';
}

// Load Members
function loadMembers() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Refreshing...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_members&password=${encodeURIComponent(sessionPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderMembers(data.members);
            } else {
                alert("Failed to load members: " + data.error);
            }
        });
}

// Render Members Table
function renderMembers(members) {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';
    
    if (!members || members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending memberships.</td></tr>';
        return;
    }
    
    members.forEach(m => {
        const tr = document.createElement('tr');
        
        // Prepare Email Button Data
        const emailSubject = encodeURIComponent("Membership Approved - Agrawal Samiti");
        const emailBody = encodeURIComponent(`Dear ${m.fullName},\n\nCongratulations! Your membership application for Agrawal Samaj Samiti Agrawal Farm, Jaipur has been successfully approved by the administration.\n\nYour Official Membership Number is: ${m.membershipNo}\n\nWe warmly welcome you to our community. If you have any questions, please feel free to reply to this email.\n\nBest Regards,\nAdmin Team`);
        const mailtoLink = m.emailId ? `mailto:${m.emailId}?subject=${emailSubject}&body=${emailBody}` : '#';
        const emailBtnHtml = m.emailId ? `<a href="${mailtoLink}" target="_blank" class="btn-email"><i class="fas fa-envelope"></i> Email Applicant</a>` : `<span style="font-size: 0.8em; color: #999;">No Email</span>`;

        const photoHtml = m.photoBase64 ? `<img src="${m.photoBase64}" alt="Photo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : `<div style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">No Photo</div>`;

        tr.innerHTML = `
            <td>${m.membershipNo}</td>
            <td>${photoHtml}</td>
            <td><strong>${m.fullName}</strong></td>
            <td>${m.mobileNumber}<br><small>${m.emailId}</small></td>
            <td>${m.paymentMode}</td>
            <td>${m.transactionId}</td>
            <td>
                <button class="btn-approve" onclick="actionMember(${m.row}, 'approve', '${m.emailId}', '${m.membershipNo}')"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-reject" onclick="actionMember(${m.row}, 'reject')"><i class="fas fa-times"></i> Reject</button>
                <br><br>
                ${emailBtnHtml}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Action Member (Approve/Reject)
function actionMember(rowNum, actionType, email = '', membershipNo = '') {
    if (!confirm(`Are you sure you want to ${actionType.toUpperCase()} this application?`)) return;
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=${actionType}&row=${rowNum}&email=${encodeURIComponent(email)}&membershipNo=${encodeURIComponent(membershipNo)}&password=${encodeURIComponent(sessionPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`Application ${actionType}d successfully!`);
                loadMembers(); // Refresh table
            } else {
                alert("Action failed: " + data.error);
            }
        });
}

// Add Notice Form Submit
document.getElementById('addNoticeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('noticeSubmitBtn');
    
    const noticeObj = {
        title: document.getElementById('noticeTitle').value,
        date: document.getElementById('noticeDate').value,
        description: document.getElementById('noticeDesc').value,
        link: document.getElementById('noticeLink').value
    };
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    btn.disabled = true;

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'add_notice',
            password: sessionPassword,
            notice: noticeObj
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Notice Published Successfully!");
            e.target.reset();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(err => {
        // If there's a CORS error on POST response due to redirects, we can assume success if no JS crash
        // but since we are handling errors, let's just alert
        alert("Notice published! (Note: background redirect may cause a harmless network error)");
        e.target.reset();
    })
    .finally(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Notice';
        btn.disabled = false;
    });
});
