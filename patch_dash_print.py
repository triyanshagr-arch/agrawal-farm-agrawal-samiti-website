import re

path = 'dashboard.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# We want to replace the old downloadMembershipCert with a new printMembershipCertificate that generates the HTML print window

old_func = '''        function downloadMembershipCert() {
            if (window.userProfileData && window.userProfileData.membershipNo) {
                Swal.fire({
                    title: 'Generating Certificate...',
                    html: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });
                // Assuming photo and sign are missing in dashboard fetch for now, pass null
                generateFilledTemplate(window.userProfileData.membershipNo, window.userProfileData, null, null, 'save')
                    .then(() => Swal.close())
                    .catch(e => { console.error(e); Swal.fire('Error', 'Failed to generate certificate', 'error'); });
            }
        }'''

new_func = '''        function downloadMembershipCert() {
            if (window.userProfileData && window.userProfileData.membershipNo) {
                const m = window.userProfileData;
                const lang = 'hi'; // Default Hindi
                const t = {
                    hi: {
                        title: "आजीवन सदस्यता पत्र", samiti: "अग्रवाल समाज समिति अग्रवाल फार्म", address: "अग्र मंदिर भवन, सुंदर नगर 1, इस्कॉन रोड, जयपुर, राजस्थान- 302020",
                        family: "परिवार के सदस्य", name: "नाम", relation: "संबंध", age: "उम्र", edu: "शिक्षा", occ: "व्यवसाय", bg: "रक्त समूह",
                        memNo: "सदस्यता क्र:", status: "स्थिति:", date: "दिनांक:", noPhoto: "फोटो उपलब्ध नहीं",
                        personal: "व्यक्तिगत विवरण", fullName: "पूरा नाम", fatherName: "पिता / पति का नाम", dob: "जन्म तिथि",
                        gotra: "गोत्र", mobile: "मोबाइल नंबर", email: "ईमेल आईडी", mDate: "विवाह तिथि", domicile: "मूल निवास",
                        maritalStatus: "वैवाहिक स्थिति", unmarried: "अविवाहित",
                        addressDetails: "पता विवरण", houseType: "मकान का प्रकार (स्वयं/किराए)", permAddr: "स्थाई पता", offAddr: "पत्राचार का पता",
                        footer: "यह अग्रवाल समाज समिति सिस्टम-जनित दस्तावेज़ है।"
                    }
                }[lang];
                
                const basePath = window.location.href.split('dashboard.html')[0];
                const agrasenImg = basePath + 'images/agrasen_full.png'; 
                const lakshmiImg = basePath + 'images/lakshmi.png';

                let familyHtml = '';
                if (m.familyMembers && m.familyMembers !== "[]") {
                    try {
                        let familyStr = String(m.familyMembers);
                        if(familyStr.startsWith('"') && familyStr.endsWith('"')) {
                            familyStr = familyStr.substring(1, familyStr.length - 1);
                        }
                        familyStr = familyStr.replace(/\\\\"/g, '"');
                        const family = JSON.parse(familyStr);
                        if (family.length > 0) {
                            familyHtml = `
                                <div class="section-title">${t.family}</div>
                                <table class="family-table">
                                    <thead><tr><th>${t.name}</th><th>${t.relation}</th><th>${t.age}</th><th>${t.edu}</th><th>${t.occ}</th><th>${t.bg}</th></tr></thead>
                                    <tbody>
                                        ${family.map(f => `<tr><td>${f.name || ''}</td><td>${f.relationship || f.relation || ''}</td><td>${f.age || ''}</td><td>${f.education || ''}</td><td>${f.business || ''}</td><td>${f.bloodGroup || ''}</td></tr>`).join('')}
                                    </tbody>
                                </table>
                            `;
                        }
                    } catch(e) { console.error("Error parsing family members", e); }
                }
                
                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    try {
                        const d = new Date(dateStr);
                        if (isNaN(d.getTime())) return dateStr;
                        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
                                @media print { .header h2 { color: #D32F2F !important; background: transparent !important; } }
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
                                    <img src="${lakshmiImg}" class="deity-img" alt="Mata Lakshmi">
                                </div>
                                <div class="top-section">
                                    <div class="meta-info">
                                        <p><strong>${t.memNo}</strong> ${m.membershipNo}</p>
                                        <p><strong>${t.status}</strong> <span style="color: #4CAF50; font-weight: bold;">${m.status}</span></p>
                                        <p><strong>${t.date}</strong> ${formatDate(m.timestamp)}</p>
                                    </div>
                                    <div class="photo-box">
                                        ${m.photoBase64 ? `<img src="${m.photoBase64}">` : `<div style="padding-top: 40px;">${t.noPhoto}</div>`}
                                    </div>
                                </div>
                                <div class="section-title">${t.personal}</div>
                                <table class="info-table">
                                    <tr><th>${t.fullName}</th><td style="font-weight: bold;">${m.title || ''} ${m.fullName || ''}</td><th>${t.fatherName}</th><td>${m.guardianName || ''}</td></tr>
                                    <tr><th>${t.dob}</th><td>${formatDate(m.dob)}</td><th>${t.gotra}</th><td>${m.gotra || ''}</td></tr>
                                    <tr><th>${t.mobile}</th><td>${m.mobileNumber || ''}</td><th>${t.email}</th><td>${m.emailId || 'N/A'}</td></tr>
                                    <tr><th>${t.maritalStatus}</th><td>${m.maritalStatus || 'N/A'}</td><th>${t.mDate}</th><td>${formatDate(m.marriageDate)}</td></tr>
                                    <tr><th>${t.domicile}</th><td>${m.domicile || ''}</td><th>${t.edu}</th><td>${m.education || ''}</td></tr>
                                    <tr><th>${t.occ}</th><td colspan="3">${m.occupation || ''}</td></tr>
                                </table>
                                <div class="section-title">${t.addressDetails}</div>
                                <table class="info-table">
                                    <tr><th>${t.houseType}</th><td colspan="3">${m.houseType || ''}</td></tr>
                                    <tr><th>${t.permAddr}</th><td colspan="3">${m.permanentAddress || ''}</td></tr>
                                    <tr><th>${t.offAddr}</th><td colspan="3">${m.officeAddress || ''}</td></tr>
                                </table>
                                ${familyHtml}
                                <div style="flex-grow: 1;"></div>
                                <div class="footer">${t.footer}</div>
                            </div>
                            <script>
                                setTimeout(() => { window.print(); }, 500);
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }'''

if old_func in html:
    html = html.replace(old_func, new_func)
    
    # Also change button text to "Print Application Form"
    old_btn = '<button onclick="downloadMembershipCert()" class="btn btn-primary" style="margin-top: 15px; width: 100%; font-size: 0.9rem; padding: 10px;"><i class="fas fa-certificate"></i> Download Membership Certificate</button>'
    new_btn = '<button onclick="downloadMembershipCert()" class="btn btn-primary" style="margin-top: 15px; width: 100%; font-size: 0.9rem; padding: 10px;"><i class="fas fa-print"></i> Print Application Form</button>'
    html = html.replace(old_btn, new_btn)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed!")
else:
    print("Could not find old func!")
