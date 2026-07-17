import re

path = 'dashboard.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Inject scripts before closing body
old_scripts = '''    <script type="module">
        import { auth, onAuthStateChanged, signOut } from './firebase_auth.js';'''

new_scripts = '''    <!-- PDF Generation Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
    <script src="pdf_generator.js?v=7"></script>
    <script>
        // Make global data objects for click handlers
        window.userProfileData = null;
        window.userDonationsData = {};

        function downloadMembershipCert() {
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
        }

        function downloadDonationCert(index) {
            const data = window.userDonationsData[index];
            if (data && data.receiptNo) {
                Swal.fire({
                    title: 'Generating Receipt...',
                    html: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });
                generateHindiDonationCertificate(data.receiptNo, data)
                    .then(() => Swal.close())
                    .catch(e => { console.error(e); Swal.fire('Error', 'Failed to generate receipt', 'error'); });
            }
        }
    </script>

    <script type="module">
        import { auth, onAuthStateChanged, signOut } from './firebase_auth.js';'''

html = html.replace(old_scripts, new_scripts)

# 2. Update renderProfile
old_profile = '''        function renderProfile(profile) {
            const container = document.getElementById('membershipContent');
            if (!profile) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff9800; margin-bottom: 10px;"></i>
                        <p style="color: #666; margin-bottom: 15px;">No membership profile linked to this number.</p>
                        <a href="sadasyata.html" class="btn btn-primary" style="text-decoration: none; display: inline-block;">Apply for Membership</a>
                    </div>`;
                return;
            }

            container.innerHTML = `
                <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">${profile.fullName}</h4>
                    <p style="margin: 5px 0; color: #555;"><strong>Member ID:</strong> ${profile.membershipNo || 'Awaiting ID'}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${getStatusBadge(profile.status)}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>Joined:</strong> ${new Date(profile.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        }'''

new_profile = '''        function renderProfile(profile) {
            window.userProfileData = profile;
            const container = document.getElementById('membershipContent');
            if (!profile) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #ff9800; margin-bottom: 10px;"></i>
                        <p style="color: #666; margin-bottom: 15px;">No membership profile linked to this number.</p>
                        <a href="sadasyata.html" class="btn btn-primary" style="text-decoration: none; display: inline-block;">Apply for Membership</a>
                    </div>`;
                return;
            }

            let certBtnHtml = '';
            if ((profile.status === 'Approved' || profile.status === 'Verified') && profile.membershipNo) {
                certBtnHtml = `<button onclick="downloadMembershipCert()" class="btn btn-primary" style="margin-top: 15px; width: 100%; font-size: 0.9rem; padding: 10px;"><i class="fas fa-certificate"></i> Download Membership Certificate</button>`;
            }

            container.innerHTML = `
                <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">${profile.fullName}</h4>
                    <p style="margin: 5px 0; color: #555;"><strong>Member ID:</strong> ${profile.membershipNo || 'Awaiting ID'}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${getStatusBadge(profile.status)}</p>
                    <p style="margin: 5px 0; color: #555;"><strong>Joined:</strong> ${new Date(profile.timestamp).toLocaleDateString()}</p>
                    ${certBtnHtml}
                </div>
            `;
        }'''

html = html.replace(old_profile, new_profile)

# 3. Update renderDonations
old_donations = '''        function renderDonations(donations) {
            const container = document.getElementById('donationsContent');
            if (!donations || donations.length === 0) {
                container.innerHTML = `<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">No donation history found for this number.</p>`;
                return;
            }

            let html = '<div style="max-height: 300px; overflow-y: auto;">';
            donations.forEach(d => {
                html += `
                    <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #333;">₹${d.donationAmount}</strong>
                            <p style="margin: 2px 0; font-size: 0.85em; color: #666;">${d.donationPurpose}</p>
                            <small style="color: #999;">${new Date(d.timestamp).toLocaleDateString()}</small>
                        </div>
                        <div>
                            ${getStatusBadge(d.status)}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }'''

new_donations = '''        function renderDonations(donations) {
            const container = document.getElementById('donationsContent');
            if (!donations || donations.length === 0) {
                container.innerHTML = `<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">No donation history found for this number.</p>`;
                return;
            }

            let htmlStr = '<div style="max-height: 300px; overflow-y: auto;">';
            donations.forEach((d, index) => {
                window.userDonationsData[index] = d;
                
                let certBtn = '';
                if ((d.status === 'Approved' || d.status === 'Verified') && d.receiptNo) {
                    certBtn = `<button onclick="downloadDonationCert(${index})" class="btn btn-secondary" style="font-size: 0.8rem; padding: 5px 10px; margin-top: 5px;"><i class="fas fa-download"></i> Receipt</button>`;
                }

                htmlStr += `
                    <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #333;">₹${d.donationAmount}</strong>
                            <p style="margin: 2px 0; font-size: 0.85em; color: #666;">${d.donationPurpose}</p>
                            <small style="color: #999;">${new Date(d.timestamp).toLocaleDateString()}</small>
                            ${certBtn ? '<br>' + certBtn : ''}
                        </div>
                        <div>
                            ${getStatusBadge(d.status)}
                        </div>
                    </div>
                `;
            });
            htmlStr += '</div>';
            container.innerHTML = htmlStr;
        }'''

html = html.replace(old_donations, new_donations)

# We need the hidden certificate template from admin.html to be present in dashboard.html so pdf_generator.js can use it!
template_div = '''    <!-- Hidden Certificate Template for PDF Generator -->
    <div id="certificateContainer" style="position: absolute; top: -9999px; left: -9999px;">
        <div id="certTemplate" style="width: 1122px; height: 793px; background-color: #fffdf0; position: relative; padding: 40px; box-sizing: border-box; font-family: 'Tiro Devanagari Hindi', serif; color: #333; overflow: hidden; text-align: center;">
            <div style="position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px; border: 8px solid #8B0000;"></div>
            <div style="position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 2px solid #D4AF37;"></div>
            <img src="images/agrasen_full.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); height: 600px; opacity: 0.08; z-index: 0;" crossorigin="anonymous">
            <div style="position: relative; z-index: 1; height: 100%;">
                <img src="images/agrasen_full.png" style="position: absolute; top: 10px; left: 20px; width: 115px; height: 145px;" crossorigin="anonymous">
                <img src="images/lakshmi.png" style="position: absolute; top: 10px; right: -5px; width: 190px; height: 145px; object-fit: contain;" crossorigin="anonymous">
                <h1 style="color: #8B0000; font-family: 'Yatra One', display; font-size: 38px; margin: 35px 150px 5px 150px; line-height: 1.2;">अग्रवाल समाज समिति, अग्रवाल फार्म, जयपुर</h1>
                <p style="font-size: 18px; color: #555; margin: 0 150px; line-height: 1.4;">(पंजीकृत: 169/93-94)<br>अग्र-मन्दिर भवन, सुन्दर नगर प्रथम, इस्कॉन रोड, मानसरोवर, जयपुर-302020</p>
                <div style="margin: 30px auto; display: inline-block; padding: 10px 60px; border-top: 2px solid #D4AF37; border-bottom: 2px solid #D4AF37;">
                    <h2 style="font-family: 'Yatra One', display; font-size: 48px; color: #D4AF37; margin: 0;">दान प्रमाण-पत्र</h2>
                </div>
                <div style="margin-top: 20px; line-height: 2.2; font-size: 26px; padding: 0 80px;">
                    प्रमाणित किया जाता है कि <span style="color: #8B0000; font-weight: bold;" id="certDonorName">XXXXXXX</span> ने 
                    <span style="color: #8B0000; font-weight: bold;" id="certPurpose">XXXXXXX</span> के पावन कार्य हेतु 
                    <span style="color: #D4AF37; font-weight: bold; font-size: 32px;">₹<span id="certAmount">0</span>/-</span> का अमूल्य दान दिया है।
                    <br><br>
                    समिति आपके इस पुनीत कार्य और सहयोग के लिए हार्दिक आभार व्यक्त करती है।<br>भगवान श्री अग्रसेन और माता लक्ष्मी की कृपा आप और आपके परिवार पर सदैव बनी रहे।
                </div>
                <div style="position: absolute; bottom: 40px; width: 100%; left: 0; padding: 0 60px; display: flex; justify-content: space-between; font-size: 20px; box-sizing: border-box; font-weight: bold;">
                    <div style="text-align: left;">
                        <p style="margin: 5px 0;">दिनांक: <strong id="certDate">00/00/0000</strong></p>
                        <p style="margin: 5px 0;">रसीद क्र.: <strong id="certReceiptNo">0000</strong></p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 5px 0; font-family: 'Yatra One'; color: #8B0000; font-size: 24px;">✓ ई-हस्ताक्षरित</p>
                        <p style="margin: 5px 0; border-top: 2px solid #333; padding-top: 5px; font-size: 18px;">अधिकृत हस्ताक्षरकर्ता</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
'''

if '<footer class="footer">' in html:
    html = html.replace('<footer class="footer">', template_div + '\n    <footer class="footer">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
print("dashboard patched!")
