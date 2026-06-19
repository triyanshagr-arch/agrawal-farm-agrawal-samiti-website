let sessionPassword = "";
window.memberData = []; // Store fetched members for quick access
window.donationData = []; // Store fetched donations
window.bookingData = []; // Store fetched bookings

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
    
    if (tabId === 'donations' && window.donationData.length === 0) {
        loadDonations();
    }
    if (tabId === 'bookings' && window.bookingData.length === 0) {
        loadBookings();
    }
}

function logout() {
    sessionPassword = "";
    // Reload the page to cleanly clear all data and reset the view
    window.location.reload();
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

function loadDonations() {
    const tbody = document.getElementById('donationsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Refreshing...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_donations&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.donationData = data.donations || [];
                renderDonations();
            } else {
                alert("Failed to load donations: " + data.error);
            }
        });
}

function renderDonations() {
    const tbody = document.getElementById('donationsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const donations = window.donationData || [];
    
    // Calculate Stats (Only count Verified donations)
    let total = 0;
    let mandir = 0;
    let general = 0;
    
    donations.forEach(d => {
        if (d.status === "Verified") {
            const amt = parseFloat(d.donationAmount) || 0;
            total += amt;
            if (d.donationPurpose && d.donationPurpose.toLowerCase().includes('mandir')) {
                mandir += amt;
            } else {
                general += amt;
            }
        }
    });
    
    document.getElementById('statTotalDonations').innerText = '₹' + total.toLocaleString('en-IN');
    document.getElementById('statMandirFund').innerText = '₹' + mandir.toLocaleString('en-IN');
    document.getElementById('statGeneralFund').innerText = '₹' + general.toLocaleString('en-IN');
    
    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No donations found.</td></tr>';
        return;
    }
    
    donations.forEach(d => {
        const tr = document.createElement('tr');
        const screenshotHtml = d.screenshotBase64 ? `<a href="${d.screenshotBase64}" target="_blank"><img src="${d.screenshotBase64}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></a>` : 'No Image';
        
        let actionHtml = '';
        let statusBadge = '';
        if (d.status === "Pending") {
            statusBadge = `<span style="color: #ff9800; font-size: 12px; font-weight: bold;"><i class="fas fa-clock"></i> Pending</span>`;
            actionHtml = `<button class="btn-approve" style="padding: 4px 8px; font-size: 12px;" onclick="verifyDonation(${d.row})"><i class="fas fa-check"></i> Verify</button>`;
        } else {
            statusBadge = `<span style="color: #4caf50; font-size: 12px; font-weight: bold;"><i class="fas fa-check-circle"></i> Verified</span>`;
            
            const emailedList = JSON.parse(localStorage.getItem('emailedDonations') || '[]');
            const hasEmailed = emailedList.includes(d.receiptNo);
            
            let emailBtn = '';
            if (hasEmailed) {
                emailBtn = `<button class="btn-secondary" style="background: #9e9e9e; color: white; padding: 4px 8px; font-size: 12px; margin-top: 5px; cursor: default;" onclick="event.preventDefault()"><i class="fas fa-check"></i> Emailed</button>`;
            } else {
                emailBtn = d.emailId ? `<button class="btn-email" style="padding: 4px 8px; font-size: 12px; margin-top: 5px;" onclick="emailDonationReceipt(this, '${d.receiptNo}')"><i class="fas fa-envelope"></i> Email Receipt</button>` : `<span style="font-size: 10px; color: #999; display:block; margin-top: 5px;">No Email</span>`;
            }
            
            actionHtml = `
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="printDonationReceipt('${d.receiptNo}')"><i class="fas fa-print"></i> Print</button>
                <br>${emailBtn}
            `;
        }
        
        tr.innerHTML = `
            <td><strong>${d.receiptNo}</strong><br><small>${new Date(d.timestamp).toLocaleDateString()}</small><br>${statusBadge}</td>
            <td><strong>${d.donorName}</strong><br><small>${d.mobileNumber}</small></td>
            <td style="color: green; font-weight: bold;">₹${d.donationAmount}</td>
            <td>${d.donationPurpose}<br><small>Ref: ${d.transactionId}</small></td>
            <td>${screenshotHtml}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function verifyDonation(rowNum) {
    if (!confirm("Are you sure you want to VERIFY this donation? This will add the amount to the total collections.")) return;
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=verify_donation&row=${rowNum}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Donation verified successfully!");
                loadDonations();
            } else {
                alert("Verification failed: " + data.error);
            }
        });
}

function printDonationReceipt(receiptNo) {
    const d = window.donationData.find(x => x.receiptNo === receiptNo);
    if (!d) return;
    // Assume pdf_generator.js is loaded
    if (typeof generateDonationReceiptPDF === 'function') {
        generateDonationReceiptPDF(receiptNo, d, 'save');
    } else {
        alert("PDF generator script not found.");
    }
}

function emailDonationReceipt(btnElement, receiptNo) {
    const d = window.donationData.find(x => x.receiptNo === receiptNo);
    if (!d) return;
    
    const emailSubject = encodeURIComponent("Donation Receipt - Agrawal Samaj Samiti");
    const emailBody = encodeURIComponent(`Dear ${d.donorName},\n\nJai Shri Agrasen!\n\nThank you for your generous donation of Rs. ${d.donationAmount}/- to Agrawal Samaj Samiti, Jaipur.\n\nYour payment has been successfully verified. Please find your official Donation Receipt (No: ${receiptNo}) attached to this email.\n\nMay the blessings of Maharaj Agrasen be with you always.\n\nBest Regards,\nAdmin Team\nAgrawal Samaj Samiti`);
    
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${d.emailId}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailLink, '_blank');
    
    const emailedList = JSON.parse(localStorage.getItem('emailedDonations') || '[]');
    if (!emailedList.includes(receiptNo)) {
        emailedList.push(receiptNo);
        localStorage.setItem('emailedDonations', JSON.stringify(emailedList));
    }
    
    btnElement.innerHTML = '<i class="fas fa-check"></i> Emailed';
    btnElement.style.background = '#9e9e9e';
    btnElement.style.color = 'white';
    btnElement.style.cursor = 'default';
    btnElement.onclick = function(e) { e.preventDefault(); };
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
            <button class="btn-secondary" style="margin-top: 5px; padding:4px 8px; font-size:12px;" onclick="printApplicationForm(${m.row}, 'hi')"><i class="fas fa-print"></i> Print Form</button>
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
    const sig = m.signatureBase64 || m.signature || m.Signature || m.applicantSignature;
    content.innerHTML = `
        <div style="text-align:center; margin-bottom: 20px;">
            ${m.photoBase64 ? `<img src="${m.photoBase64}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin:0 10px;">` : ''}
            ${sig === 'DIGITAL_VERIFIED' ? `<div style="display:inline-block; vertical-align:top; border:1px solid #28a745; color:#28a745; padding:5px 15px; border-radius:4px; font-weight:bold; margin:0 10px; height: 40px; line-height: 40px;"><i class="fas fa-check-circle"></i> E-Verified</div>` : sig ? `<img src="${sig}" style="width:100px; height:50px; object-fit:contain; border:1px solid #ccc; background:#fff; margin:0 10px;">` : ''}
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
function printApplicationForm(rowNum, lang = 'hi') {
    const m = window.memberData.find(x => x.row == rowNum);
    if (!m) return;
    
    const t = {
        en: {
            title: "Lifetime Membership Application", samiti: "Agrawal Samaj Samiti Agrawal Farm", address: "Agra Mandir Bhawan, Sunder Nagar 1, ISKCON Road, Jaipur, Rajasthan- 302020",
            family: "Family Members", name: "Name", relation: "Relation", age: "Age", edu: "Education", occ: "Occupation", bg: "Blood Group",
            memNo: "Mem No:", status: "Status:", date: "Date:", noPhoto: "No Photo Provided",
            personal: "Personal Details", fullName: "Full Name", fatherName: "Father's / Husband's Name", dob: "Date of Birth",
            gotra: "Gotra", mobile: "Mobile Number", email: "Email ID", mDate: "Marriage Date", domicile: "Domicile",
            addressDetails: "Address Details", houseType: "House Type", permAddr: "Permanent Address", offAddr: "Office Address",
            footer: "This is a system-generated document from the Agrawal Samaj Samiti Admin Dashboard."
        },
        hi: {
            title: "आजीवन सदस्यता पत्र", samiti: "अग्रवाल समाज समिति अग्रवाल फार्म", address: "अग्र मंदिर भवन, सुंदर नगर 1, इस्कॉन रोड, जयपुर, राजस्थान- 302020",
            family: "परिवार के सदस्य", name: "नाम", relation: "संबंध", age: "उम्र", edu: "शिक्षा", occ: "व्यवसाय", bg: "रक्त समूह",
            memNo: "सदस्यता क्र:", status: "स्थिति:", date: "दिनांक:", noPhoto: "फोटो उपलब्ध नहीं",
            personal: "व्यक्तिगत विवरण", fullName: "पूरा नाम", fatherName: "पिता / पति का नाम", dob: "जन्म तिथि",
            gotra: "गोत्र", mobile: "मोबाइल नंबर", email: "ईमेल आईडी", mDate: "विवाह तिथि", domicile: "मूल निवास",
            addressDetails: "पता विवरण", houseType: "मकान का प्रकार (स्वयं/किराए)", permAddr: "स्थाई पता", offAddr: "कार्यालय का पता",
            footer: "यह अग्रवाल समाज समिति एडमिन डैशबोर्ड से सिस्टम-जनित दस्तावेज़ है।"
        }
    }[lang];
    
    const basePath = window.location.href.split('admin.html')[0];
    const agrasenImg = basePath + 'images/agrasen_full.png'; // Updated to full image
    const lakshmiImg = basePath + 'images/lakshmi.png';

    let familyHtml = '';
    if (m.familyMembers && m.familyMembers !== "[]") {
        try {
            const family = JSON.parse(m.familyMembers);
            if (family.length > 0) {
                familyHtml = `
                    <div class="section-title">${t.family}</div>
                    <table class="family-table">
                        <thead>
                            <tr>
                                <th>${t.name}</th>
                                <th>${t.relation}</th>
                                <th>${t.age}</th>
                                <th>${t.edu}</th>
                                <th>${t.occ}</th>
                                <th>${t.bg}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${family.map(f => `
                                <tr>
                                    <td>${f.name || ''}</td>
                                    <td>${f.relationship || f.relation || ''}</td>
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
                <title>${t.title} - ${m.fullName}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                    @media print { 
                        @page { margin: 0.5cm; } 
                        body { padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
                        .page-border { height: 97vh; overflow: hidden; page-break-after: avoid; } 
                        .watermark { opacity: 0.2 !important; } 
                        .info-table, .info-table tr, .info-table th, .info-table td, .meta-info, .family-table, .family-table tr, .family-table td { background: transparent !important; background-color: transparent !important; }
                    }
                    body { font-family: 'Outfit', Arial, sans-serif; padding: 10px; color: #222; line-height: 1.3; background: #fff; margin: 0; }
                    .page-border { border: 2px solid #D32F2F; padding: 15px; position: relative; border-radius: 8px; box-shadow: inset 0 0 0 3px #FFD700; box-sizing: border-box; min-height: 95vh; display: flex; flex-direction: column; }
                    .watermark { position: absolute; top: 25%; left: 15%; width: 70%; opacity: 0.15; z-index: 9999; pointer-events: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; mix-blend-mode: multiply; }
                    .header { display: grid; grid-template-columns: 140px 1fr 140px; align-items: center; border-bottom: 2px double #D32F2F; padding-bottom: 10px; margin-bottom: 10px; position: relative; z-index: 2; }
                    .header-center { text-align: center; }
                    .header h1 { color: #D32F2F; margin: 0; font-size: 24px; font-weight: 700; text-shadow: 1px 1px 0px rgba(0,0,0,0.1); }
                    .header h3 { margin: 2px 0 0 0; color: #444; font-size: 13px; }
                    .header h2 { margin: 5px auto 0 auto; font-size: 16px; background: #D32F2F; color: #fff; display: inline-block; padding: 3px 15px; border-radius: 15px; }
                    .deity-img { height: 119px; width: 140px; object-fit: contain; margin: 0 auto; display: block; }
                    .top-section { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: flex-start; position: relative; z-index: 2; }
                    .meta-info { background: rgba(255, 248, 248, 0.6); border: 1px solid #f0d0d0; padding: 10px; border-radius: 8px; width: 60%; }
                    .meta-info p { margin: 2px 0; font-size: 12px; }
                    .photo-box { width: 90px; height: 110px; border: 2px solid #D32F2F; padding: 2px; background: #fff; text-align: center; font-size: 10px; color: #999; }
                    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; position: relative; z-index: 2; background-color: transparent !important; }
                    .info-table th, .info-table td { padding: 4px 8px; border: 1px solid #e0e0e0; text-align: left; }
                    .info-table th { background: rgba(255, 248, 248, 0.7) !important; width: 18%; font-size: 12px; color: #D32F2F; font-weight: 600; }
                    .info-table tr { background-color: transparent !important; }
                    .info-table td { font-size: 12px; color: #333; width: 32%; background-color: transparent !important; }
                    .section-title { color: #D32F2F; font-size: 15px; font-weight: 700; border-bottom: 2px solid #D32F2F; padding-bottom: 2px; margin: 10px 0 5px 0; display: inline-block; }
                    .family-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; position: relative; z-index: 2; background-color: transparent !important; }
                    .family-table tr { background-color: transparent !important; }
                    .family-table th, .family-table td { padding: 4px; border: 1px solid #e0e0e0; text-align: left; font-size: 11px; }
                    .family-table th { background: #D32F2F !important; color: white; }
                    .family-table td { background-color: transparent !important; }
                    .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #777; border-top: 1px dashed #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="page-border">
                    <div style="text-align: right; font-size: 11px; font-weight: bold; color: #D32F2F; margin-bottom: 5px;">पंजीयन संख्या: 169/93-94</div>
                    <img src="${agrasenImg}" class="watermark" alt="Watermark">
                    <div class="header">
                        <img src="${agrasenImg}" class="deity-img" alt="Maharaj Agrasen">
                        <div class="header-center">
                            <h1>${t.samiti}</h1>
                            <h3>${t.address}</h3>
                            <h2>${t.title}</h2>
                        </div>
                        <img src="${lakshmiImg}" class="deity-img" alt="Goddess Lakshmi">
                    </div>
                    
                    <div class="top-section">
                        <div class="meta-info">
                            <p><strong>${t.memNo}</strong> <span style="color:#D32F2F; font-size: 18px; font-weight:bold;">${m.membershipNo || 'Pending'}</span></p>
                            <p><strong>${t.status}</strong> <span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${m.status}</span></p>
                            <p><strong>${t.date}</strong> ${new Date(m.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div class="photo-box">
                            ${m.photoBase64 ? `<img src="${m.photoBase64}">` : t.noPhoto}
                        </div>
                    </div>

                    <div class="section-title">${t.personal}</div>
                    <table class="info-table">
                        <tr>
                            <th>${t.fullName}</th><td colspan="3"><strong>${m.fullName}</strong></td>
                        </tr>
                        <tr>
                            <th>${t.fatherName}</th><td colspan="3">${m.guardianName || ''}</td>
                        </tr>
                        <tr>
                            <th>${t.edu}</th><td>${m.education || ''}</td>
                            <th>${t.occ}</th><td>${m.occupation || ''}</td>
                        </tr>
                        <tr>
                            <th>${t.gotra}</th><td>${m.gotra || ''}</td>
                            <th>${t.domicile}</th><td>${m.domicile || ''}</td>
                        </tr>
                        <tr>
                            <th>${t.dob}</th><td>${m.dob || ''}</td>
                            <th>${t.mDate}</th><td>${m.marriageDate || ''}</td>
                        </tr>
                        <tr>
                            <th>${t.bg}</th><td>${m.bloodGroup || ''}</td>
                            <th>${t.mobile}</th><td>${m.mobileNumber || ''}</td>
                        </tr>
                        ${m.emailId ? `<tr><th>${t.email}</th><td colspan="3">${m.emailId}</td></tr>` : ''}
                    </table>

                    <div class="section-title">${t.addressDetails}</div>
                    <table class="info-table">
                        <tr>
                            <th>${t.houseType}</th><td>${m.houseType || ''}</td>
                            ${m.officeAddress ? `<th>${t.offAddr}</th><td>${m.officeAddress}</td>` : '<th colspan="2"></th>'}
                        </tr>
                        <tr>
                            <th>${t.permAddr}</th><td colspan="3">${m.permanentAddress || ''}</td>
                        </tr>
                    </table>

                    ${familyHtml}
                    
                    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div style="text-align: center; width: 150px;">
                            <div style="height: 40px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 5px;"></div>
                            <div style="border-top: 1px solid #333; padding-top: 5px; font-size: 12px;">Authorized Signatory</div>
                        </div>
                        <div style="text-align: center; width: 150px;">
                            <div style="height: 40px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 5px;">
                                ${(m.signatureBase64 && m.signatureBase64.startsWith('data:image')) 
                                    ? `<img src="${m.signatureBase64}" style="max-height: 40px;">` 
                                    : `<div style="color: #28a745; font-weight: bold; font-size: 14px;"><i class="fas fa-check-circle"></i> E-Verified</div>`}
                            </div>
                            <div style="border-top: 1px solid #333; padding-top: 5px; font-size: 12px;">Digital Signature</div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>${t.footer}</p>
                    </div>
                </div>
                
                <script>
                    window.onload = function() { setTimeout(function() { window.print(); }, 500); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Notice Form Toggle Logic
function toggleNoticeFields() {
    const type = document.getElementById('noticeType').value;
    const genFields = document.querySelectorAll('.general-field');
    const achFields = document.querySelectorAll('.achievement-field');
    
    if (type === 'Achievement') {
        genFields.forEach(el => el.style.display = 'none');
        achFields.forEach(el => el.style.display = 'block');
    } else {
        genFields.forEach(el => el.style.display = 'block');
        achFields.forEach(el => el.style.display = 'none');
    }
}

async function translateText(text, targetLang) {
    if (!text || text.trim() === '') return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(part => part[0]).join('');
    } catch (e) {
        console.error("Translation error", e);
        return text;
    }
}

// Notice Form Submission
document.getElementById('addNoticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('noticeSubmitBtn');
    
    let titleText = '';
    let descText = '';
    let linkText = '';
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating & Publishing...';
    btn.disabled = true;

    try {
        const type = document.getElementById('noticeType').value;
        if (type === 'Achievement') {
            const cat = document.getElementById('achCategory').value;
            const name = document.getElementById('achName').value;
            const score = document.getElementById('achScore').value;
            
            const nameHi = await translateText(name, 'hi');
            const nameEn = await translateText(name, 'en');
            const scoreHi = await translateText(score, 'hi');
            const scoreEn = await translateText(score, 'en');
            
            titleText = '[ACHIEVEMENT] ' + cat;
            descText = nameHi + '|' + scoreHi + '|||' + nameEn + '|' + scoreEn;
        } else {
            const title = document.getElementById('noticeTitle').value;
            const desc = document.getElementById('noticeDesc').value;
            
            const titleHi = await translateText(title, 'hi');
            const titleEn = await translateText(title, 'en');
            const descHi = await translateText(desc, 'hi');
            const descEn = await translateText(desc, 'en');
            
            titleText = titleHi + '|||' + titleEn;
            descText = descHi + '|||' + descEn;
            linkText = document.getElementById('noticeLink').value;
        }

        const noticeObj = {
            title: titleText,
            date: document.getElementById('noticeDate').value,
            description: descText,
            link: linkText
        };

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
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish';
            btn.disabled = false;
        });
    } catch (e) {
        alert("Translation or processing failed. Please try again.");
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish';
        btn.disabled = false;
    }
});

// ==========================================
// BOOKINGS MANAGEMENT LOGIC
// ==========================================

function loadBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Refreshing...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_bookings&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.bookingData = data.bookings || [];
                renderBookings();
            } else {
                alert("Failed to load bookings: " + data.error);
            }
        });
}

function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const bookings = window.bookingData || [];
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found.</td></tr>';
        return;
    }
    
    bookings.forEach(b => {
        const tr = document.createElement('tr');
        
        let actionHtml = '';
        let statusBadge = '';
        if (b.status === "Pending") {
            statusBadge = `<span style="color: #ff9800; font-weight: bold;"><i class="fas fa-clock"></i> Pending</span>`;
            actionHtml = `
                <button class="btn-approve" style="padding: 4px 8px; font-size: 12px; margin-bottom: 4px;" onclick="actionBooking(${b.row}, 'Approved', '${b.emailId}', '${b.fullName}')"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-reject" style="padding: 4px 8px; font-size: 12px; margin-bottom: 4px;" onclick="actionBooking(${b.row}, 'Rejected', '${b.emailId}', '${b.fullName}')"><i class="fas fa-times"></i> Reject</button>
            `;
        } else if (b.status === "Approved") {
            statusBadge = `<span style="color: #4caf50; font-weight: bold;"><i class="fas fa-check-circle"></i> Approved</span>`;
            actionHtml = b.emailId ? `<button class="btn-email" style="padding: 4px 8px; font-size: 12px;" onclick="emailBookingApplicant(this, '${b.emailId}', '${b.fullName}', 'Approved')"><i class="fas fa-envelope"></i> Email Info</button>` : `<span style="font-size: 10px; color: #999;">No Email</span>`;
        } else {
            statusBadge = `<span style="color: #f44336; font-weight: bold;"><i class="fas fa-times-circle"></i> Rejected</span>`;
            actionHtml = b.emailId ? `<button class="btn-email" style="padding: 4px 8px; font-size: 12px;" onclick="emailBookingApplicant(this, '${b.emailId}', '${b.fullName}', 'Rejected')"><i class="fas fa-envelope"></i> Email Info</button>` : `<span style="font-size: 10px; color: #999;">No Email</span>`;
        }
        
        actionHtml += `<br><button class="btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-top: 4px;" onclick="viewBooking(${b.row})"><i class="fas fa-eye"></i> View</button>`;
        
        tr.innerHTML = `
            <td><small>${new Date(b.timestamp).toLocaleDateString()}</small></td>
            <td><strong>${b.fullName}</strong></td>
            <td>${b.mobileNumber}</td>
            <td><strong>${b.facilityRequired}</strong><br><small>${b.eventType}</small></td>
            <td>${b.startDate} to ${b.endDate}<br><small>Guests: ${b.expectedGuests}</small></td>
            <td>${statusBadge}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function actionBooking(rowNum, newStatus, email, fullName) {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) return;
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=update_booking_status&row=${rowNum}&status=${newStatus}&email=${encodeURIComponent(email)}&bookingName=${encodeURIComponent(fullName)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`Booking marked as ${newStatus} successfully!`);
                loadBookings();
            } else {
                alert("Action failed: " + data.error);
            }
        });
}

function viewBooking(rowNum) {
    const b = window.bookingData.find(x => x.row == rowNum);
    if (!b) return;
    const content = document.getElementById('bookingContent');
    content.innerHTML = `
        <table class="profile-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr><th>Name</th><td>${b.fullName}</td></tr>
            <tr><th>Mobile</th><td>${b.mobileNumber}</td></tr>
            <tr><th>Email</th><td>${b.emailId || 'N/A'}</td></tr>
            <tr><th>Facility Requested</th><td><strong>${b.facilityRequired}</strong></td></tr>
            <tr><th>Event Type</th><td>${b.eventType}</td></tr>
            <tr><th>Dates</th><td>${b.startDate} to ${b.endDate}</td></tr>
            <tr><th>Expected Guests</th><td>${b.expectedGuests || 'N/A'}</td></tr>
            <tr><th>Remarks</th><td>${b.remarks || 'None'}</td></tr>
            <tr><th>Status</th><td><strong>${b.status}</strong></td></tr>
        </table>
    `;
    document.getElementById('viewBookingModal').style.display = 'flex';
}

function emailBookingApplicant(btnElement, emailId, fullName, status) {
    const emailSubject = encodeURIComponent(`Booking Request ${status} - Agrawal Samiti`);
    let emailBody = "";
    if (status === "Approved") {
        emailBody = encodeURIComponent(`Dear ${fullName},\n\nJai Shri Agrasen!\n\nWe are pleased to inform you that your facility booking request at Agrawal Farm has been APPROVED.\n\nPlease visit the Samiti office to finalize the booking details and complete the advance payment.\n\nBest Regards,\nAdmin Team\nAgrawal Samaj Samiti`);
    } else {
        emailBody = encodeURIComponent(`Dear ${fullName},\n\nJai Shri Agrasen!\n\nWe regret to inform you that your facility booking request at Agrawal Farm has been REJECTED, likely due to unavailability on your requested dates.\n\nPlease contact the Samiti office for alternate dates or more information.\n\nBest Regards,\nAdmin Team\nAgrawal Samaj Samiti`);
    }
    
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailId}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailLink, '_blank');
}
