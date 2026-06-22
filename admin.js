let sessionPassword = "";
window.memberData = []; // Store fetched members for quick access
window.donationData = []; // Store fetched donations
window.bookingData = []; // Store fetched bookings
window.expenseData = []; // Store fetched expenses

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
    if (tabId === 'expenses' && window.expenseData.length === 0) {
        loadExpenses();
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
                Swal.fire("Failed to load members: " + data.error);
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
                Swal.fire("Failed to load donations: " + data.error);
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
        
        // Unpack screenshot if it was appended to transactionId
        if (d.transactionId && String(d.transactionId).includes('|||')) {
            const parts = String(d.transactionId).split('|||');
            d.transactionId = parts[0];
            d.screenshotBase64 = parts[1];
        }

        const screenshotHtml = d.screenshotBase64 ? `<a href="#" onclick="viewPaymentScreenshot('donation', ${d.row}); return false;"><img src="${d.screenshotBase64}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></a>` : 'No Image';
        
        let actionHtml = '';
        let statusBadge = '';
        if (d.status === "Pending") {
            statusBadge = `<span style="color: #ff9800; font-size: 12px; font-weight: bold;"><i class="fas fa-clock"></i> Pending</span>`;
            actionHtml = `<button class="btn-approve" style="padding: 4px 8px; font-size: 12px;" onclick="verifyDonation(${d.row})"><i class="fas fa-check"></i> Verify</button>`;
        } else {
            statusBadge = `<span style="color: #4caf50; font-size: 12px; font-weight: bold;"><i class="fas fa-check-circle"></i> Verified</span>`;
            
            let emailedList = [];
            try { emailedList = JSON.parse(localStorage.getItem('emailedDonations') || '[]'); } catch(e) {}
            if (!Array.isArray(emailedList)) emailedList = [];
            
            const hasEmailed = emailedList.includes(d.receiptNo);
            
            const gridBtnStyle = "padding: 6px 2px; font-size: 11px; border: 1px solid #d1d5db; background: #f3f4f6; border-radius: 6px; color: #374151; cursor: pointer; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: background 0.2s;";
            const hoverOn = "this.style.background='#e5e7eb'";
            const hoverOff = "this.style.background='#f3f4f6'";
            
            let emailBtn = '';
            if (hasEmailed) {
                emailBtn = `<button style="${gridBtnStyle}" onclick="event.preventDefault()"><i class="fas fa-check" style="color:#10b981; font-size: 14px;"></i>Emailed</button>`;
            } else {
                emailBtn = d.emailId ? `<button onclick="emailDonationReceipt(this, '${d.receiptNo}')" style="${gridBtnStyle}" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-envelope" style="color:#3b82f6; font-size: 14px;"></i>Email</button>` : `<div style="${gridBtnStyle} background:#e5e7eb; color:#9ca3af; cursor:default;"><i class="fas fa-envelope-slash" style="font-size: 14px;"></i>No Email</div>`;
            }
            
            const printHtml = `<button style="${gridBtnStyle}" onclick="printDonationReceipt('${d.receiptNo}')" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-print" style="color:#ef4444; font-size: 14px;"></i>Print</button>`;
            const certHtml = `<button style="${gridBtnStyle}" onclick="downloadDonationCertificate('${d.receiptNo}')" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-certificate" style="color:#f59e0b; font-size: 14px;"></i>Certificate</button>`;
            
            actionHtml = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    ${printHtml}
                    ${certHtml}
                    ${emailBtn}
                </div>
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

async function verifyDonation(rowNum) {
    const conf = await Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to VERIFY this donation? This will add the amount to the total collections.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Verify!'
    });
    if (!conf.isConfirmed) return;
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=verify_donation&row=${rowNum}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire("Donation verified successfully!");
                loadDonations();
            } else {
                Swal.fire("Verification failed: " + data.error);
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
        Swal.fire("PDF generator script not found.");
    }
}

function downloadDonationCertificate(receiptNo) {
    const d = window.donationData.find(x => x.receiptNo === receiptNo);
    if (!d) return;
    // Assume pdf_generator.js is loaded
    if (typeof generateHindiDonationCertificate === 'function') {
        generateHindiDonationCertificate(receiptNo, d);
    } else {
        Swal.fire("PDF generator script not found.");
    }
}

function emailDonationReceipt(btnElement, receiptNo) {
    const d = window.donationData.find(x => x.receiptNo === receiptNo);
    if (!d) return;
    
    const emailSubject = encodeURIComponent("Donation Receipt - Agrawal Samaj Samiti");
    const emailBody = encodeURIComponent(`Dear ${d.donorName},\n\nJai Shri Agrasen!\n\nThank you for your generous donation of Rs. ${d.donationAmount}/- to Agrawal Samaj Samiti, Jaipur.\n\nYour payment has been successfully verified. Please find your official Donation Receipt (No: ${receiptNo}) attached to this email.\n\nMay the blessings of Maharaj Agrasen be with you always.\n\nBest Regards,\nAdmin Team\nAgrawal Samaj Samiti`);
    
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${d.emailId}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailLink, '_blank');
    
    let emailedList = [];
    try { emailedList = JSON.parse(localStorage.getItem('emailedDonations') || '[]'); } catch(e) {}
    if (!Array.isArray(emailedList)) emailedList = [];
    
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
    
    let emailedList = [];
    try { emailedList = JSON.parse(localStorage.getItem('emailedMembers') || '[]'); } catch(e) {}
    if (!Array.isArray(emailedList)) emailedList = [];
    
    if (!emailedList.includes(membershipNo)) {
        emailedList.push(membershipNo);
        localStorage.setItem('emailedMembers', JSON.stringify(emailedList));
    }
    
    btnElement.innerHTML = '<i class="fas fa-check"></i> Email Sent';
    btnElement.style.background = '#9e9e9e';
    btnElement.style.cursor = 'default';
    btnElement.onclick = function(e) { e.preventDefault(); };
};

function createMemberRow(m, isPending, index) {
    const tr = document.createElement('tr');
    tr.className = "fade-in";
    tr.style.animationDelay = `${index * 0.05}s`;

    // Unpack screenshot if it was appended to transactionId
    if (m.transactionId && String(m.transactionId).includes('|||')) {
        const parts = String(m.transactionId).split('|||');
        m.transactionId = parts[0];
        m.screenshotBase64 = parts[1];
    }
    
    let emailedList = [];
    try { emailedList = JSON.parse(localStorage.getItem('emailedMembers') || '[]'); } catch(e) {}
    if (!Array.isArray(emailedList)) emailedList = [];
    
    const hasEmailed = emailedList.includes(m.membershipNo);
    
    const gridBtnStyle = "padding: 6px 2px; font-size: 11px; border: 1px solid #d1d5db; background: #f3f4f6; border-radius: 6px; color: #374151; cursor: pointer; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: background 0.2s;";
    const hoverOn = "this.style.background='#e5e7eb'";
    const hoverOff = "this.style.background='#f3f4f6'";
    
    let emailBtnHtml;
    if (hasEmailed) {
        emailBtnHtml = `<button style="${gridBtnStyle}" onclick="event.preventDefault()"><i class="fas fa-check" style="color:#10b981; font-size: 14px;"></i>Emailed</button>`;
    } else {
        emailBtnHtml = m.emailId ? `<button onclick="sendEmail(this, '${m.emailId}', '${m.membershipNo}', '${(m.fullName || '').replace(/'/g, "\\'")}')" style="${gridBtnStyle}" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-envelope" style="color:#3b82f6; font-size: 14px;"></i>Email</button>` : `<div style="${gridBtnStyle} background:#e5e7eb; color:#9ca3af; cursor:default;"><i class="fas fa-envelope-slash" style="font-size: 14px;"></i>No Email</div>`;
    }

    const photoHtml = m.photoBase64 ? `<img src="${m.photoBase64}" style="width:40px;height:40px;object-fit:cover;border-radius:50%;cursor:pointer;" onclick="viewProfile(${m.row})">` : '<i class="fas fa-user-circle" style="font-size:40px;color:#ccc;cursor:pointer;" onclick="viewProfile('+m.row+')"></i>';

    const screenshotHtml = m.screenshotBase64 ? `<br><a href="#" onclick="viewPaymentScreenshot('membership', ${m.row}); return false;" style="font-size: 11px; color: #1976d2; display: inline-block; margin-top: 4px;"><i class="fas fa-receipt"></i> View Receipt</a>` : '';

    const printHtml = `<button style="${gridBtnStyle}" onclick="printApplicationForm(${m.row}, 'hi')" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-print" style="color:#ef4444; font-size: 14px;"></i>Print</button>`;
    const viewHtml = `<button style="${gridBtnStyle}" onclick="viewProfile(${m.row})" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-eye" style="color:#10b981; font-size: 14px;"></i>View</button>`;
    const editHtml = `<button style="${gridBtnStyle}" onclick="editProfile(${m.row})" onmouseover="${hoverOn}" onmouseout="${hoverOff}"><i class="fas fa-edit" style="color:#f59e0b; font-size: 14px;"></i>Edit</button>`;

    let actionHtml = '';
    if (isPending) {
        actionHtml = `
            <button class="btn-approve" style="width: 100%; margin-bottom: 6px;" onclick="actionMember(${m.row}, 'approve', '${m.emailId}', '${m.membershipNo}')"><i class="fas fa-check"></i> Approve</button>
            <button class="btn-reject" style="width: 100%; margin-bottom: 6px;" onclick="actionMember(${m.row}, 'reject')"><i class="fas fa-times"></i> Reject</button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                ${viewHtml}
                ${editHtml}
            </div>
        `;
    } else {
        actionHtml = `
            <div style="color: #10b981; font-weight: bold; text-align: center; margin-bottom: 8px; font-size: 13px;"><i class="fas fa-check-circle"></i> Approved</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                ${viewHtml}
                ${editHtml}
                ${printHtml}
                ${emailBtnHtml}
            </div>
        `;
    }

    if (isPending) {
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox" value="${m.row}" data-email="${m.emailId}" data-membership="${m.membershipNo}" data-name="${m.fullName}"></td>
            <td>${m.membershipNo}</td>
            <td>${photoHtml}</td>
            <td><strong>${m.fullName}</strong><br><small style="color:#666;">Gotra: ${m.gotra}</small></td>
            <td>${m.mobileNumber}<br><small>${m.emailId}</small></td>
            <td>${m.paymentMode}</td>
            <td>${m.transactionId}${screenshotHtml}</td>
            <td>${actionHtml}</td>
        `;
    } else {
        tr.innerHTML = `
            <td>${m.membershipNo}</td>
            <td>${photoHtml}</td>
            <td><strong>${m.fullName}</strong><br><small style="color:#666;">Gotra: ${m.gotra}</small></td>
            <td>${m.mobileNumber}<br><small>${m.emailId}</small></td>
            <td>${m.paymentMode}</td>
            <td>${m.transactionId}${screenshotHtml}</td>
            <td>${actionHtml}</td>
        `;
    }
    return tr;
}

// Download Excel
function downloadExcel() {
    if (window.downloadExcelUrl) window.open(window.downloadExcelUrl, '_blank');
    else Swal.fire("Export URL not available. Please refresh the page.");
}

window.viewPaymentScreenshot = function(type, rowNum) {
    let imgData = null;
    if (type === 'donation') {
        const d = window.donationData.find(x => x.row === rowNum);
        if (d) imgData = d.screenshotBase64;
    } else if (type === 'membership') {
        const m = window.memberData.find(x => x.row === rowNum);
        if (m) imgData = m.screenshotBase64;
    }
    
    if (imgData) {
        if(typeof Swal !== 'undefined') {
            let fileName = 'Payment_Screenshot.png';
            if (type === 'donation') fileName = 'Donation_Screenshot.png';
            if (type === 'membership') fileName = 'Membership_Screenshot.png';

            Swal.fire({
                title: 'Payment Screenshot',
                html: `
                    <div style="max-height: 65vh; overflow-y: auto; text-align: center; margin-bottom: 10px; border: 1px solid #ddd; padding: 5px; border-radius: 8px; background: #f9f9f9;">
                        <img src="${imgData}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                    </div>
                    <div>
                        <a href="${imgData}" download="${fileName}" style="display: inline-block; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: inherit;"><i class="fas fa-download"></i> Download Image</a>
                    </div>
                `,
                width: '600px',
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#d32f2f'
            });
        } else {
            const win = window.open();
            if(win) {
                win.document.write(`<img src="${imgData}" style="max-width:100%;">`);
            } else {
                alert("Popup blocked. Please allow popups to view the receipt.");
            }
        }
    }
};

// Single Action
async function actionMember(rowNum, actionType, email = '', existingMembershipNo = '') {
    let finalMembershipNo = existingMembershipNo;
    
    if (actionType === 'approve') {
        const { value: result } = await Swal.fire({
            title: 'Enter Official Membership Number',
            text: `Please enter the Official Membership Number for this approved member:`,
            input: 'text',
            inputValue: existingMembershipNo || "",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value.trim()) {
                    return 'Membership Number is required to approve an application!'
                }
            }
        });
        if (!result) return;
        finalMembershipNo = result;
    }

    const conf = await Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to ${actionType.toUpperCase()} this application?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${actionType} it!`
    });
    if (!conf.isConfirmed) return;

    fetch(`${GOOGLE_SCRIPT_URL}?action=${actionType}&row=${rowNum}&email=${encodeURIComponent(email)}&membershipNo=${encodeURIComponent(finalMembershipNo)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire(`Application ${actionType}d successfully!`);
                loadMembers(); 
            } else Swal.fire("Action failed: " + data.error);
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
    if (checkboxes.length === 0) { Swal.fire('Please select at least one application to approve.'); return; }
    
    const conf = await Swal.fire({
        title: 'Are you sure?',
        text: `Approve ${checkboxes.length} selected applications?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, approve all!'
    });
    if (!conf.isConfirmed) return;
    
    const approvals = [];
    
    // First, prompt for missing membership numbers before starting any fetch requests
    for (let cb of checkboxes) {
        let membershipNo = cb.getAttribute('data-membership');
        const name = cb.getAttribute('data-name') || 'Applicant';
        
        if (!membershipNo || membershipNo === 'undefined' || membershipNo === 'null' || !membershipNo.trim()) {
            const { value: result } = await Swal.fire({
                title: 'Official Membership Number',
                text: `Enter Official Membership Number for ${name}:`,
                input: 'text',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value.trim()) {
                        return 'Membership Number is required!'
                    }
                }
            });
            if (!result) {
                Swal.fire('Bulk approval cancelled.');
                return; // User cancelled
            }
            membershipNo = result;
        }
        
        approvals.push({
            row: cb.value,
            email: cb.getAttribute('data-email'),
            membershipNo: membershipNo.trim()
        });
    }

    if (approvals.length === 0) {
        Swal.fire('No applications selected or all were skipped.');
        return;
    }

    const btn = document.getElementById('btnBulkApprove');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
    btn.disabled = true;

    for (let app of approvals) {
        await fetch(`${GOOGLE_SCRIPT_URL}?action=approve&row=${app.row}&email=${encodeURIComponent(app.email)}&membershipNo=${encodeURIComponent(app.membershipNo)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`);
    }
    
    Swal.fire('Bulk approval complete!');
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
            Swal.fire('Member updated successfully!');
            closeModal('editProfileModal');
            loadMembers();
        } else {
            Swal.fire('Error: ' + data.error);
        }
    })
    .catch(err => {
        // Handle CORS redirect false positive
        Swal.fire('Member updated! (Background refresh may occur)');
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
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch(e) { return dateStr; }
    };
    
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
                    .header h2 { margin: 5px auto 0 auto; font-size: 16px; border: 2px solid #D32F2F; background: #D32F2F !important; color: #fff !important; display: inline-block; padding: 3px 15px; border-radius: 15px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @media print {
                        .header h2 { color: #D32F2F !important; background: transparent !important; }
                    }
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
                    .lh-top-phrases { text-align: center; font-size: 11px; font-weight: bold; color: #D32F2F; margin-bottom: 5px; }
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
                            <p><strong>${t.date}</strong> ${formatDate(m.timestamp)}</p>
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
                            <th>${t.dob}</th><td>${formatDate(m.dob)}</td>
                            <th>${t.mDate}</th><td>${formatDate(m.marriageDate)}</td>
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
                            <div style="height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: -5px;">
                                <img src="images/auth_signature.png?v=4" style="max-height: 80px; max-width: 150%; object-fit: contain; mix-blend-mode: multiply; filter: contrast(1000%); clip-path: inset(5px);" crossorigin="anonymous">
                            </div>
                            <div style="border-top: 1px solid #333; padding-top: 5px; font-size: 12px; position: relative; z-index: 2;">Authorized Signatory</div>
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
            if (data.success) { Swal.fire("Notice Published Successfully!"); e.target.reset(); } 
            else { Swal.fire("Error: " + data.error); }
        })
        .catch(err => {
            Swal.fire("Notice published! (Note: background redirect may cause a harmless network error)");
            e.target.reset();
        })
        .finally(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish';
            btn.disabled = false;
        });
    } catch (e) {
        Swal.fire("Translation or processing failed. Please try again.");
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
                Swal.fire("Failed to load bookings: " + data.error);
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

async function actionBooking(rowNum, newStatus, email, fullName) {
    const conf = await Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, mark as ${newStatus}!`
    });
    if (!conf.isConfirmed) return;
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=update_booking_status&row=${rowNum}&status=${newStatus}&email=${encodeURIComponent(email)}&bookingName=${encodeURIComponent(fullName)}&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire(`Booking marked as ${newStatus} successfully!`);
                loadBookings();
            } else {
                Swal.fire("Action failed: " + data.error);
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

// --- Monthly Report Generator ---
window.promptMonthlyReport = async function() {
    const { value: monthStr } = await Swal.fire({
        title: 'Generate Monthly Report',
        html: '<input id="swal-input-month" type="month" class="swal2-input" value="' + new Date().toISOString().slice(0,7) + '">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Generate PDF',
        confirmButtonColor: '#d32f2f',
        preConfirm: () => {
            return document.getElementById('swal-input-month').value;
        }
    });

    if (monthStr) {
        Swal.fire({
            title: 'Generating Report...',
            text: 'Please wait while we prepare the PDF.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });
        await generateMonthlyReportPDF(monthStr);
    }
}

async function getBase64ImageFromUrl(imageUrl) {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return null;
    }
}

async function generateMonthlyReportPDF(monthStr) {
    if (!window.memberData || !window.donationData) {
        Swal.fire("Error", "Data is not fully loaded yet. Please wait.", "error");
        return;
    }

    const [year, month] = monthStr.split('-');
    const dateObj = new Date(year, parseInt(month) - 1, 1);
    const monthName = dateObj.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    // Filter Members
    const membersThisMonth = window.memberData.filter(m => {
        if(m.status !== "Approved") return false;
        const d = new Date(m.timestamp);
        return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
    });

    // Filter Donations
    const donationsThisMonth = window.donationData.filter(d => {
        const dt = new Date(d.timestamp);
        return dt.getFullYear() === parseInt(year) && (dt.getMonth() + 1) === parseInt(month);
    });

    let totalDonations = 0;
    let mandirFund = 0;
    let generalFund = 0;

    donationsThisMonth.forEach(d => {
        // Only sum Verified donations for the totals
        if (d.status === "Verified") {
            const amt = parseFloat(d.donationAmount) || 0;
            totalDonations += amt;
            if (d.donationPurpose && d.donationPurpose.toLowerCase().includes('mandir')) {
                mandirFund += amt;
            } else {
                generalFund += amt;
            }
        }
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header Images
    const agrasenBase64 = await getBase64ImageFromUrl('images/agrasen_full.png');
    if (agrasenBase64) {
        doc.addImage(agrasenBase64, 'PNG', 14, 8, 20, 26);
    }
    
    const lakshmiBase64 = await getBase64ImageFromUrl('images/lakshmi.png');
    if (lakshmiBase64) {
        doc.addImage(lakshmiBase64, 'PNG', 176, 8, 20, 26);
    }
    
    // Header Text
    doc.setFontSize(20);
    doc.setTextColor(211, 47, 47); // Red
    doc.text("Agrawal Samaj Samiti, Jaipur", 105, 18, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Monthly Admin Report: ${monthName}`, 105, 26, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 32, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 38, 196, 38);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(211, 47, 47);
    doc.text("1. Executive Summary", 14, 48);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`New Members Approved: ${membersThisMonth.length}`, 20, 58);
    doc.text(`Total Donations Collected: Rs. ${totalDonations.toLocaleString('en-IN')}`, 20, 66);
    doc.text(`- Mandir Fund: Rs. ${mandirFund.toLocaleString('en-IN')}`, 25, 74);
    doc.text(`- General Fund: Rs. ${generalFund.toLocaleString('en-IN')}`, 25, 82);

    // Members Table
    doc.setFontSize(14);
    doc.setTextColor(211, 47, 47);
    doc.text("2. New Members Joined", 14, 95);
    
    const memberRows = membersThisMonth.map((m, i) => [
        i + 1,
        m.membershipNo || '-',
        m.fullName || '-',
        m.mobileNumber || '-',
        new Date(m.timestamp).toLocaleDateString('en-IN')
    ]);

    doc.autoTable({
        startY: 100,
        head: [['S.No', 'Membership No.', 'Name', 'Mobile', 'Join Date']],
        body: memberRows.length ? memberRows : [['-', '-', 'No new members joined this month', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [211, 47, 47] },
        styles: { fontSize: 10 }
    });

    // Donations Table
    let finalY = doc.lastAutoTable.finalY || 105;
    
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    } else {
        finalY += 15;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(211, 47, 47);
    doc.text("3. Donations Received (Including Pending)", 14, finalY);
    
    const donationRows = donationsThisMonth.map((d, i) => [
        i + 1,
        d.donorName || '-',
        d.donationPurpose || '-',
        `Rs. ${parseFloat(d.donationAmount || 0).toLocaleString('en-IN')}`,
        d.status || 'Pending'
    ]);

    doc.autoTable({
        startY: finalY + 5,
        head: [['S.No', 'Donor Name', 'Purpose', 'Amount', 'Status']],
        body: donationRows.length ? donationRows : [['-', 'No donations received this month', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [211, 47, 47] },
        styles: { fontSize: 10 }
    });

    // Save PDF
    doc.save(`Monthly_Report_${monthName.replace(' ', '_')}.pdf`);
    
    Swal.fire({
        icon: 'success',
        title: 'Report Generated',
        text: 'The monthly report PDF has been downloaded successfully.',
        timer: 3000,
        showConfirmButton: false
    });
}

// --- Expense Manager Functions ---

function openAddExpenseModal() {
    document.getElementById('addExpenseForm').reset();
    document.getElementById('expDate').valueAsDate = new Date();
    document.getElementById('addExpenseModal').style.display = 'block';
}

function loadExpenses() {
    if (!sessionPassword) return;
    
    document.getElementById('expensesTableBody').innerHTML = '<tr><td colspan="6" class="text-center">Loading expenses...</td></tr>';
    
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_expenses&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                window.expenseData = data.expenses || [];
                renderExpenses();
            } else {
                document.getElementById('expensesTableBody').innerHTML = `<tr><td colspan="6" class="text-center error-text">${data.message || 'Error loading expenses.'}</td></tr>`;
            }
        })
        .catch(err => {
            console.error("Error fetching expenses:", err);
            document.getElementById('expensesTableBody').innerHTML = `<tr><td colspan="6" class="text-center error-text">Failed to connect to server.</td></tr>`;
        });
}

function renderExpenses() {
    const expenses = window.expenseData || [];
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('searchExpenses') ? document.getElementById('searchExpenses').value.toLowerCase() : '';
    const filterDateVal = document.getElementById('filterExpenseDate') ? document.getElementById('filterExpenseDate').value : '';
    
    let totalExp = 0;
    let constructionExp = 0;
    let eventExp = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let count = 0;
    expenses.forEach((exp) => {
        // [Date, Category, Description, Amount, Payment Mode, Added By]
        const dateStr = exp[0];
        const category = exp[1];
        const description = exp[2];
        const amount = parseFloat(exp[3]) || 0;
        const mode = exp[4];
        const addedBy = exp[5];

        const dateObj = new Date(dateStr);
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
            totalExp += amount;
            if (category === 'Temple Construction') constructionExp += amount;
            else eventExp += amount;
        }

        // Apply Date Filter
        if (filterDateVal) {
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;
            if (formattedDate !== filterDateVal) return;
        }

        const matchStr = `${category} ${description} ${amount} ${addedBy}`.toLowerCase();
        if (searchVal && !matchStr.includes(searchVal)) return;

        count++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(dateStr).toLocaleDateString('en-IN')}</td>
            <td><span class="badge" style="background: #e0e0e0; color: #333; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">${category}</span></td>
            <td>${description}</td>
            <td style="color: #f44336; font-weight: bold;">₹${amount.toLocaleString('en-IN')}</td>
            <td>${mode}</td>
            <td>${addedBy}</td>
        `;
        tbody.appendChild(tr);
    });

    if (count === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No expenses found matching criteria.</td></tr>';
    }

    document.getElementById('statTotalExpenses').innerText = '₹' + totalExp.toLocaleString('en-IN');
    document.getElementById('statConstructionExp').innerText = '₹' + constructionExp.toLocaleString('en-IN');
    document.getElementById('statEventExp').innerText = '₹' + eventExp.toLocaleString('en-IN');
}

// --- Add Multiple Expenses ---

function addExpenseLineItem() {
    const container = document.getElementById('expenseLineItems');
    const template = `
        <div class="expense-item premium-card">
            <span class="remove-item" onclick="this.parentElement.remove()" title="Remove this item"><i class="fas fa-times"></i></span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label>Category</label>
                    <select class="expCategory form-control" required>
                        <option value="Temple Construction">Temple Construction</option>
                        <option value="Event">Event</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Salary">Salary</option>
                        <option value="Bills">Electricity/Water Bills</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label>Payment Mode</label>
                    <select class="expMode form-control" required>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                    <label>Description / विवरण</label>
                    <input type="text" class="expDescription" placeholder="What was this expense for?" required>
                </div>
                <div>
                    <label>Amount (₹)</label>
                    <input type="number" class="expAmount" placeholder="0" required>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', template);
}

document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitExpense');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    try {
        const date = document.getElementById('expDate').value;
        const addedBy = document.getElementById('expAddedBy').value;
        const items = document.querySelectorAll('.expense-item');
        
        let successCount = 0;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const category = item.querySelector('.expCategory').value;
            const mode = item.querySelector('.expMode').value;
            const description = item.querySelector('.expDescription').value;
            const amount = item.querySelector('.expAmount').value;

            const formData = new FormData();
            formData.append('action', 'add_expense');
            formData.append('password', sessionPassword);
            formData.append('date', date);
            formData.append('addedBy', addedBy);
            formData.append('category', category);
            formData.append('mode', mode);
            formData.append('description', description);
            formData.append('amount', amount);

            const res = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.status === 'success') {
                successCount++;
            }
        }
        
        if (successCount === items.length) {
            Swal.fire('Success', `${successCount} expenses added successfully!`, 'success');
            closeModal('addExpenseModal');
            loadExpenses();
            // Reset the form manually to keep only 1 item
            document.getElementById('addExpenseForm').reset();
            const container = document.getElementById('expenseLineItems');
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        } else {
            Swal.fire('Warning', `Added ${successCount} out of ${items.length} expenses. Some failed.`, 'warning');
            loadExpenses();
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Connection failed during submission', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// --- Letterhead Maker Functions ---

function updateLetterheadContent() {
    const dateVal = document.getElementById('lhDate').value;
    const refVal = document.getElementById('lhRefNo').value;
    const subjectVal = document.getElementById('lhSubject').value;
    const contentVal = document.getElementById('lhContent').value;

    // Format Date
    if (dateVal) {
        const d = new Date(dateVal);
        document.querySelector('#lhDispDate span').innerText = d.toLocaleDateString('en-IN');
    } else {
        document.querySelector('#lhDispDate span').innerText = '';
    }

    // Ref No
    if (refVal.trim()) {
        document.querySelector('#lhDispRef span').innerText = refVal;
    } else {
        document.querySelector('#lhDispRef span').innerText = '';
    }

    // Subject
    if (subjectVal.trim()) {
        document.getElementById('lhDispSubjectBox').style.display = 'block';
        document.getElementById('lhDispSubject').innerText = subjectVal;
    } else {
        document.getElementById('lhDispSubjectBox').style.display = 'none';
    }

    // Body
    document.getElementById('lhDispBody').innerHTML = contentVal;
}

function previewLetterhead() {
    updateLetterheadContent();
    Swal.fire({
        title: 'Letterhead Preview',
        html: `
            <div style="transform: scale(0.6); transform-origin: top center; height: 700px; overflow-y: auto; overflow-x: hidden; border: 1px solid #ccc;">
                ${document.getElementById('letterheadTemplate').outerHTML}
            </div>
            <p style="font-size: 0.9em; color: #666;">Note: This is a scaled-down preview.</p>
        `,
        width: '850px',
        showCloseButton: true,
        showConfirmButton: false
    });
}

function printLetterhead() {
    updateLetterheadContent();
    
    const printWindow = window.open('', '_blank');
    const templateHtml = document.getElementById('letterheadTemplate').outerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Letterhead</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@500;600;700&display=swap">
                <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Yatra+One&display=swap" rel="stylesheet">
                <style>
                    body { margin: 0; padding: 0; background: #fff; display: flex; justify-content: center; }
                    .letterhead-page { width: 794px; height: 1123px; background: #ffffff; padding: 20px 30px; box-sizing: border-box; position: relative; font-family: 'Tiro Devanagari Hindi', serif; color: #333; overflow: hidden; display: flex; flex-direction: column; }
                    .lh-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 1; pointer-events: none; }
                    .lh-watermark img { width: 550px; height: auto; }
                    .lh-top-phrases { display: flex; justify-content: flex-end; font-size: 13px; font-weight: bold; margin-bottom: -5px; position: relative; z-index: 2; }
                    .phrase-red { color: #b71c1c; }
                    .phrase-blue { color: #1565c0; }
                    .lh-header-main { display: flex; align-items: center; position: relative; z-index: 2; margin-bottom: 5px; }
                    .lh-header-logo { width: 120px; text-align: center; margin-right: 5px; }
                    .lh-header-logo img { width: 100px; height: auto; }
                    .lh-header-logo .logo-subtext { font-size: 11px; color: #b71c1c; margin: 4px 0; font-weight: bold; }
                    .lh-header-title { flex: 1; text-align: center; }
                    .lh-header-title .lh-main-title { font-family: 'Yatra One', cursive; color: #8B0000; font-size: 38px; margin: 0; line-height: 1.1; white-space: nowrap; }
                    .lh-committee-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; z-index: 2; margin-bottom: 5px; border-top: 2px solid #8B0000; }
                    .grid-col { padding: 4px 2px; text-align: center; border-right: 1px solid #8B0000; }
                    .grid-col:last-child { border-right: none; }
                    .grid-col .member { margin-bottom: 5px; }
                    .grid-col .member:last-child { margin-bottom: 0; }
                    .grid-col .name { color: #1565c0; font-weight: bold; font-size: 15px; margin: 0; }
                    .grid-col .role { color: #b71c1c; font-size: 13px; margin: 1px 0; font-weight: bold; }
                    .grid-col .mob { color: #000; font-size: 12px; font-weight: bold; margin: 0; }
                    .lh-divider { height: 2px; background: #000; margin-bottom: 5px; position: relative; z-index: 2; }
                    .lh-layout { display: flex; position: relative; z-index: 2; flex: 1; }
                    .lh-sidebar { width: 200px; border-right: 1px solid #000; padding-right: 10px; text-align: center; }
                    .sidebar-member { margin-bottom: 1px; }
                    .sidebar-member.top-member { margin-bottom: 2px; }
                    .s-name { color: #1565c0; font-weight: bold; font-size: 10.5px; margin: 0; }
                    .s-role { color: #b71c1c; font-size: 8.5px; font-weight: bold; margin: 0; }
                    .sidebar-badge-wrap { text-align: center; margin: 4px 0; }
                    .sidebar-badge { background: #8B0000; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 10px; }
                    .lh-main-content { flex: 1; padding-left: 15px; display: flex; flex-direction: column; position: relative; }
                    .lh-meta { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
                    .lh-subject-box { text-align: center; font-size: 16px; margin-bottom: 15px; }
                    .lh-subject-box span { font-weight: bold; text-decoration: underline; }
                    .lh-body { font-size: 16px; line-height: 1.6; text-align: justify; flex: 1; white-space: pre-wrap; }
                    .lh-footer-address { text-align: center; color: #1565c0; z-index: 2; margin-top: auto; padding-top: 15px; border-top: 1px solid #eee; }
                    .addr-line { font-size: 15px; font-weight: bold; margin: 0; }
                    .email-line { font-size: 14px; margin: 2px 0 0 0; }
                    @media print {
                        @page { margin: 0; size: A4; }
                        body { margin: 0; padding: 0; box-shadow: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .letterhead-page { padding: 30px !important; }
                    }
                </style>
            </head>
            <body>
                ${templateHtml}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

async function downloadLetterheadPDF() {
    updateLetterheadContent();

    const element = document.getElementById('letterheadTemplate');
    const originalContainer = document.getElementById('letterheadContainer');
    
    // Temporarily bring it on screen to capture properly, but hide it visually
    originalContainer.style.left = '0';
    originalContainer.style.top = '0';
    originalContainer.style.zIndex = '-1000';
    originalContainer.style.visibility = 'visible';

    Swal.fire({
        title: 'Generating PDF',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        let filename = 'Letterhead.pdf';
        const ref = document.getElementById('lhRefNo').value.trim();
        if (ref) {
            filename = `Letterhead_${ref.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
        }
        
        pdf.save(filename);
        Swal.fire('Success', 'PDF Downloaded Successfully', 'success');

    } catch (error) {
        console.error("Error generating Letterhead PDF:", error);
        Swal.fire('Error', 'Failed to generate PDF.', 'error');
    } finally {
        // Hide again
        originalContainer.style.left = '-9999px';
        originalContainer.style.top = '-9999px';
        originalContainer.style.visibility = 'hidden';
    }
}
