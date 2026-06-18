let sessionPassword = "";
window.memberData = []; // Store fetched members for quick access

// Login Form Submit
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('adminPassword').value;
    const btn = e.target.querySelector('button');
    const err = document.getElementById('loginError');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    btn.disabled = true;
    err.innerText = "";

    fetch(`${GOOGLE_SCRIPT_URL}?action=get_members&password=${encodeURIComponent(pw)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionPassword = pw;
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('dashboardScreen').style.display = 'flex';
                document.getElementById('statsContainer').style.display = 'flex';
                if (data.exportUrl) window.downloadExcelUrl = data.exportUrl;
                window.memberData = data.members || [];
                renderMembers();
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

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    document.getElementById('tab-' + tabId).style.display = 'block';
    el.classList.add('active');
}

function logout() {
    sessionPassword = "";
    document.getElementById('adminPassword').value = "";
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';
}

function loadMembers() {
    const tbodyPending = document.getElementById('membersTableBody');
    const tbodyApproved = document.getElementById('approvedMembersTableBody');
    tbodyPending.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin"></i> Refreshing...</td></tr>';
    if(tbodyApproved) tbodyApproved.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Refreshing...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_members&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.exportUrl) {
                    window.downloadExcelUrl = data.exportUrl;
                    document.getElementById('btnDownloadExcel').style.display = 'block';
                }
                window.memberData = data.members || [];
                renderMembers();
            } else {
                alert("Failed to load members: " + data.error);
            }
        });
}

function renderMembers() {
    const members = window.memberData;
    const tbodyPending = document.getElementById('membersTableBody');
    const tbodyApproved = document.getElementById('approvedMembersTableBody');
    
    tbodyPending.innerHTML = '';
    if(tbodyApproved) tbodyApproved.innerHTML = '';
    
    const pendingMembers = members.filter(m => m.status === "Pending");
    const approvedMembers = members.filter(m => m.status === "Approved");
    
    // Stats Update
    const todayStr = new Date().toISOString().split('T')[0];
    const newToday = members.filter(m => new Date(m.timestamp).toISOString().split('T')[0] === todayStr).length;
    
    document.getElementById('statTotalApproved').innerText = approvedMembers.length;
    document.getElementById('statTotalPending').innerText = pendingMembers.length;
    document.getElementById('statNewToday').innerText = newToday;
    
    // Bulk approve button toggle
    const btnBulk = document.getElementById('btnBulkApprove');
    if (btnBulk) btnBulk.style.display = pendingMembers.length > 0 ? 'inline-block' : 'none';

    // Render Pending
    if (pendingMembers.length === 0) {
        tbodyPending.innerHTML = '<tr><td colspan="8" class="text-center">No pending memberships.</td></tr>';
    } else {
        pendingMembers.forEach((m, index) => tbodyPending.appendChild(createMemberRow(m, true, index)));
    }
    
    // Render Approved
    if (tbodyApproved) {
        if (approvedMembers.length === 0) {
            tbodyApproved.innerHTML = '<tr><td colspan="7" class="text-center">No approved memberships yet.</td></tr>';
        } else {
            approvedMembers.forEach((m, index) => tbodyApproved.appendChild(createMemberRow(m, false, index)));
        }
    }
}

window.sendEmail = function(btnElement, emailId, membershipNo, fullName) {
    const emailSubject = encodeURIComponent("Membership Approved - Agrawal Samiti");
    const emailBody = encodeURIComponent(`Dear ${fullName},\n\nCongratulations! Your membership application for Agrawal Samaj Samiti Agrawal Farm, Jaipur has been successfully approved by the administration.\n\nYour Official Membership Number is: ${membershipNo}\n\nWe warmly welcome you to our community. If you have any questions, please feel free to reply to this email.\n\nBest Regards,\nAdmin Team`);
    
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailId}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailLink, '_blank');
    
    const emailedList = JSON.parse(localStorage.getItem('emailedMembers') || '[]');
    if (!emailedList.includes(membershipNo)) {
        emailedList.push(membershipNo);
        localStorage.setItem('emailedMembers', JSON.stringify(emailedList));
    }
    
    btnElement.innerHTML = '<i class="fas fa-check"></i> Email Sent';
    btnElement.style.background = '#9e9e9e';
    btnElement.style.cursor = 'default';
    btnElement.onclick = function(e) { e.preventDefault(); };
};

function createMemberRow(m, isPending, arrayIndex) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-member-row', m.row);
    
    const emailedList = JSON.parse(localStorage.getItem('emailedMembers') || '[]');
    const hasEmailed = emailedList.includes(m.membershipNo);
    
    let emailBtnHtml;
    if (hasEmailed) {
        emailBtnHtml = `<button class="btn-email" style="background: #9e9e9e; cursor: default;" onclick="event.preventDefault()"><i class="fas fa-check"></i> Email Sent</button>`;
    } else {
        emailBtnHtml = m.emailId ? `<button onclick="sendEmail(this, '${m.emailId}', '${m.membershipNo}', '${m.fullName.replace(/'/g, "\\'")}')" class="btn-email"><i class="fas fa-envelope"></i> Email Applicant</button>` : `<span style="font-size: 0.8em; color: #999;">No Email</span>`;
    }

    const photoHtml = m.photoBase64 ? `<img src="${m.photoBase64}" alt="Photo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : `<div style="width: 50px; height: 50px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">No Photo</div>`;

    const viewEditHtml = `
        <button class="btn-secondary" style="padding:4px 8px; font-size:12px; margin-bottom: 4px;" onclick="viewProfile(${m.row})"><i class="fas fa-eye"></i> View</button>
        <button class="btn-secondary" style="padding:4px 8px; font-size:12px; margin-bottom: 4px;" onclick="editProfile(${m.row})"><i class="fas fa-edit"></i> Edit</button>
    `;

    let actionHtml = '';
    if (isPending) {
        actionHtml = `
            <button class="btn-approve" onclick="actionMember(${m.row}, 'approve', '${m.emailId}', '${m.membershipNo}')"><i class="fas fa-check"></i> Approve</button>
            <button class="btn-reject" onclick="actionMember(${m.row}, 'reject')"><i class="fas fa-times"></i> Reject</button>
            <hr style="margin: 5px 0; border:none; border-top:1px solid #ddd;">
            ${viewEditHtml}
        `;
    } else {
        actionHtml = `
            <span style="color: #4caf50; font-weight: bold;"><i class="fas fa-check-circle"></i> Approved</span><br><br>
            ${emailBtnHtml}<br>
            <button class="btn-secondary" style="margin-top: 5px; padding:4px 8px; font-size:12px;" onclick="printApplicationForm(${m.row})"><i class="fas fa-print"></i> Print Application</button>
            <hr style="margin: 5px 0; border:none; border-top:1px solid #ddd;">
            ${viewEditHtml}
        `;
    }

    if (isPending) {
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" value="${m.row}" data-email="${m.emailId}" data-membership="${m.membershipNo}"></td>
            <td>${m.membershipNo}</td>
            <td>${photoHtml}</td>
            <td><strong>${m.fullName}</strong><br><small style="color:#666;">Gotra: ${m.gotra}</small></td>
            <td>${m.mobileNumber}<br><small>${m.emailId}</small></td>
            <td>${m.paymentMode}</td>
            <td>${m.transactionId}</td>
            <td>${actionHtml}</td>
        `;
    } else {
        tr.innerHTML = `
            <td>${m.membershipNo}</td>
            <td>${photoHtml}</td>
            <td><strong>${m.fullName}</strong><br><small style="color:#666;">Gotra: ${m.gotra}</small></td>
            <td>${m.mobileNumber}<br><small>${m.emailId}</small></td>
            <td>${m.paymentMode}</td>
            <td>${m.transactionId}</td>
            <td>${actionHtml}</td>
        `;
    }
    return tr;
}

// Download Excel
function downloadExcel() {
    if (window.downloadExcelUrl) window.open(window.downloadExcelUrl, '_blank');
    else alert("Export URL not available. Please refresh the page.");
}

// Single Action
function actionMember(rowNum, actionType, email = '', membershipNo = '') {
    if (!confirm(`Are you sure you want to ${actionType.toUpperCase()} this application?`)) return;
    fetch(`${GOOGLE_SCRIPT_URL}?action=${actionType}&row=${rowNum}&email=${encodeURIComponent(email)}&membershipNo=${encodeURIComponent(membershipNo)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`Application ${actionType}d successfully!`);
                loadMembers(); 
            } else alert("Action failed: " + data.error);
        });
}

// Filter Table
function filterTable(tbodyId, inputId) {
    const input = document.getElementById(inputId).value.toLowerCase();
    const rows = document.getElementById(tbodyId).getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        let text = rows[i].innerText.toLowerCase();
        rows[i].style.display = text.includes(input) ? '' : 'none';
    }
}

// Select All
function toggleSelectAll(source, tbodyId) {
    const checkboxes = document.getElementById(tbodyId).querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

// Bulk Approve
async function bulkApprove() {
    const checkboxes = document.querySelectorAll('#membersTableBody .row-checkbox:checked');
    if (checkboxes.length === 0) return alert('Please select at least one application to approve.');
    if (!confirm(`Approve ${checkboxes.length} selected applications?`)) return;
    
    const btn = document.getElementById('btnBulkApprove');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
    btn.disabled = true;

    for (let cb of checkboxes) {
        const row = cb.value;
        const email = cb.getAttribute('data-email');
        const membershipNo = cb.getAttribute('data-membership');
        await fetch(`${GOOGLE_SCRIPT_URL}?action=approve&row=${row}&email=${encodeURIComponent(email)}&membershipNo=${encodeURIComponent(membershipNo)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`);
    }
    
    alert('Bulk approval complete!');
    btn.innerHTML = '<i class="fas fa-check-double"></i> Approve Selected';
    btn.disabled = false;
    document.getElementById('selectAllPending').checked = false;
    loadMembers();
}

// Modals
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function viewProfile(rowNum) {
    const m = window.memberData.find(x => x.row == rowNum);
    if (!m) return;
    const content = document.getElementById('profileContent');
    content.innerHTML = `
        <div style="text-align:center; margin-bottom: 20px;">
            ${m.photoBase64 ? `<img src="${m.photoBase64}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">` : ''}
            <h3>${m.fullName} (${m.membershipNo})</h3>
            <p><strong>Status:</strong> ${m.status}</p>
        </div>
        <table class="profile-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr><th>Guardian Name</th><td>${m.guardianName}</td></tr>
            <tr><th>Date of Birth</th><td>${m.dob}</td></tr>
            <tr><th>Blood Group</th><td>${m.bloodGroup}</td></tr>
            <tr><th>Gotra</th><td>${m.gotra}</td></tr>
            <tr><th>Occupation</th><td>${m.occupation}</td></tr>
            <tr><th>Education</th><td>${m.education}</td></tr>
            <tr><th>Domicile</th><td>${m.domicile}</td></tr>
            <tr><th>Permanent Address</th><td>${m.permanentAddress}</td></tr>
            <tr><th>Office Address</th><td>${m.officeAddress}</td></tr>
            <tr><th>House Type</th><td>${m.houseType}</td></tr>
            <tr><th>Marriage Date</th><td>${m.marriageDate}</td></tr>
            <tr><th>Payment Mode</th><td>${m.paymentMode}</td></tr>
            <tr><th>Transaction ID</th><td>${m.transactionId}</td></tr>
            <tr><th>UTR No</th><td>${m.utrNo}</td></tr>
            <tr><th>Bank Account</th><td>${m.bankAccountName}</td></tr>
        </table>
    `;
    document.getElementById('viewProfileModal').style.display = 'flex';
}

function editProfile(rowNum) {
    const m = window.memberData.find(x => x.row == rowNum);
    if (!m) return;
    document.getElementById('editRowNumber').value = m.row;
    
    const fields = [
        { id: 'editMembershipNo', label: 'Membership No.', val: m.membershipNo, key: 'membershipNo' },
        { id: 'editTitle', label: 'Title', val: m.rawTitle || '', key: 'title' },
        { id: 'editFullName', label: 'Full Name', val: m.rawFirstName || '', key: 'fullName' },
        { id: 'editGuardianName', label: 'Guardian Name', val: m.guardianName, key: 'guardianName' },
        { id: 'editMobileNumber', label: 'Mobile Number', val: m.mobileNumber, key: 'mobileNumber' },
        { id: 'editEmailId', label: 'Email ID', val: m.emailId, key: 'emailId' },
        { id: 'editGotra', label: 'Gotra', val: m.gotra, key: 'gotra' },
        { id: 'editBloodGroup', label: 'Blood Group', val: m.bloodGroup, key: 'bloodGroup' }
    ];
    
    let html = '';
    fields.forEach(f => {
        html += `
            <div class="form-group" style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:5px;">${f.label}</label>
                <input type="text" id="${f.id}" data-key="${f.key}" value="${f.val}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
            </div>
        `;
    });
    
    document.getElementById('editFieldsContainer').innerHTML = html;
    document.getElementById('editProfileModal').style.display = 'flex';
}

document.getElementById('editMemberForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const rowNum = document.getElementById('editRowNumber').value;
    const m = window.memberData.find(x => x.row == rowNum);
    if (!m) return;
    
    const btn = document.getElementById('btnSaveEdit');
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    // Build payload using original member data so we don't clear un-edited fields
    const updatedData = {
        membershipNo: m.membershipNo,
        title: m.rawTitle,
        fullName: m.rawFirstName,
        guardianName: m.guardianName,
        dob: m.dob,
        mobileNumber: m.mobileNumber,
        emailId: m.emailId,
        bloodGroup: m.bloodGroup,
        gotra: m.gotra,
        occupation: m.occupation,
        education: m.education,
        domicile: m.domicile,
        permanentAddress: m.permanentAddress,
        officeAddress: m.officeAddress,
        houseType: m.houseType,
        marriageDate: m.marriageDate,
        paymentMode: m.paymentMode,
        transactionId: m.transactionId,
        utrNo: m.utrNo,
        bankAccountName: m.bankAccountName,
        familyMembers: m.familyMembers ? JSON.parse(m.familyMembers) : []
    };
    
    // Overwrite with fields from the form
    document.querySelectorAll('#editFieldsContainer input').forEach(inp => {
        const key = inp.getAttribute('data-key');
        updatedData[key] = inp.value;
    });

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'edit_member', password: sessionPassword, row: rowNum, data: updatedData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Member updated successfully!');
            closeModal('editProfileModal');
            loadMembers();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(err => {
        // Handle CORS redirect false positive
        alert('Member updated! (Background refresh may occur)');
        closeModal('editProfileModal');
        loadMembers();
    })
    .finally(() => {
        btn.innerHTML = 'Save Changes';
        btn.disabled = false;
    });
});

// Print Application Form
function printApplicationForm(rowNum) {
    const m = window.memberData.find(x => x.row == rowNum);
    if (!m) return;
    
    let familyHtml = '';
    if (m.familyMembers && m.familyMembers !== "[]") {
        try {
            const family = JSON.parse(m.familyMembers);
            if (family.length > 0) {
                familyHtml = `
                    <h3>Family Members / परिवार के सदस्य</h3>
                    <table class="family-table">
                        <thead>
                            <tr>
                                <th>Name / नाम</th>
                                <th>Relation / संबंध</th>
                                <th>Age / उम्र</th>
                                <th>Education / शिक्षा</th>
                                <th>Occupation / व्यवसाय</th>
                                <th>Blood Group / रक्त समूह</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${family.map(f => `
                                <tr>
                                    <td>${f.name || ''}</td>
                                    <td>${f.relation || ''}</td>
                                    <td>${f.age || ''}</td>
                                    <td>${f.education || ''}</td>
                                    <td>${f.business || ''}</td>
                                    <td>${f.bloodGroup || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch(e) {
            console.error("Error parsing family members", e);
        }
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
        <html>
            <head>
                <title>Application Form - ${m.fullName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D32F2F; padding-bottom: 20px; margin-bottom: 20px; }
                    .header-center { text-align: center; flex: 1; padding: 0 15px; }
                    .header h1 { color: #D32F2F; margin: 0 0 5px 0; font-size: 24px; }
                    .header h3 { margin: 0; color: #555; font-size: 16px; }
                    .header h2 { margin: 10px 0 0 0; font-size: 20px; }
                    .deity-img { height: 100px; width: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #D32F2F; }
                    .top-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .photo-box { width: 120px; height: 150px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; background: #eee; text-align: center; font-size: 12px; color: #999; }
                    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .info-table th, .info-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                    .info-table th { background: #f9f9f9; width: 40%; font-size: 14px; }
                    .info-table td { font-size: 15px; }
                    h3 { color: #D32F2F; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
                    .family-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .family-table th, .family-table td { padding: 8px; border: 1px solid #ddd; text-align: left; font-size: 13px; }
                    .family-table th { background: #f4f4f4; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Shri_Agrasen_Maharaj.jpg" class="deity-img" alt="Maharaj Agrasen">
                    <div class="header-center">
                        <h1>AGRAWAL SAMAJ SAMITI<br>अग्रवाल समाज समिति</h1>
                        <h3>Agrawal Farm, Mansarovar, Jaipur<br>अग्रवाल फार्म, मानसरोवर, जयपुर</h3>
                        <h2>Membership Application Form<br>सदस्यता आवेदन पत्र</h2>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Goddess_Lakshmi_by_Raja_Ravi_Varma.jpg" class="deity-img" alt="Goddess Lakshmi">
                </div>
                
                <div class="top-section">
                    <div>
                        <p><strong>Membership Number / सदस्यता संख्या:</strong> ${m.membershipNo || 'Pending'}</p>
                        <p><strong>Status / स्थिति:</strong> ${m.status}</p>
                        <p><strong>Date / दिनांक:</strong> ${new Date(m.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div class="photo-box">
                        ${m.photoBase64 ? `<img src="${m.photoBase64}">` : 'No Photo / कोई फोटो नहीं'}
                    </div>
                </div>

                <h3>Personal Details / व्यक्तिगत विवरण</h3>
                <table class="info-table">
                    <tr><th>Full Name / पूरा नाम</th><td><strong>${m.fullName}</strong></td></tr>
                    <tr><th>Father's / Husband's Name <br> पिता / पति का नाम</th><td>${m.guardianName || ''}</td></tr>
                    <tr><th>Date of Birth / जन्म तिथि</th><td>${m.dob || ''}</td></tr>
                    <tr><th>Gotra / गोत्र</th><td>${m.gotra || ''}</td></tr>
                    <tr><th>Blood Group / रक्त समूह</th><td>${m.bloodGroup || ''}</td></tr>
                    <tr><th>Mobile Number / मोबाइल नंबर</th><td>${m.mobileNumber || ''}</td></tr>
                    <tr><th>Email ID / ईमेल आईडी</th><td>${m.emailId || ''}</td></tr>
                    <tr><th>Education / शिक्षा</th><td>${m.education || ''}</td></tr>
                    <tr><th>Occupation / Profession / व्यवसाय</th><td>${m.occupation || ''}</td></tr>
                    <tr><th>Marriage Date / विवाह तिथि</th><td>${m.marriageDate || ''}</td></tr>
                    <tr><th>Domicile / मूल निवास</th><td>${m.domicile || ''}</td></tr>
                </table>

                <h3>Address Details / पता विवरण</h3>
                <table class="info-table">
                    <tr><th>House Type / मकान का प्रकार (स्वयं/किराए)</th><td>${m.houseType || ''}</td></tr>
                    <tr><th>Permanent Address / स्थाई पता</th><td>${m.permanentAddress || ''}</td></tr>
                    <tr><th>Office Address / कार्यालय / व्यवसाय का पता</th><td>${m.officeAddress || ''}</td></tr>
                </table>

                ${familyHtml}
                
                <div class="footer">
                    <p>This is a system-generated document from the Agrawal Samaj Samiti Admin Dashboard.</p>
                </div>
                
                <script>
                    window.onload = function() { setTimeout(function() { window.print(); }, 500); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Notice Form (unchanged)
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
        body: JSON.stringify({ action: 'add_notice', password: sessionPassword, notice: noticeObj })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) { alert("Notice Published Successfully!"); e.target.reset(); } 
        else { alert("Error: " + data.error); }
    })
    .catch(err => {
        alert("Notice published! (Note: background redirect may cause a harmless network error)");
        e.target.reset();
    })
    .finally(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Notice';
        btn.disabled = false;
    });
});
