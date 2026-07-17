import re

path_html = 'admin.html'
with open(path_html, 'r', encoding='utf-8') as f:
    html = f.read()

old_login_html = '''    <!-- Login Screen -->
    <div id="loginScreen" class="login-container">
        <div class="login-box">
            <img src="images/maharaj_agrasen.png" alt="Logo" class="login-logo">
            <h2>Admin Login</h2>
            <form id="loginForm">
                <input type="password" id="adminPassword" placeholder="Enter Admin Password" required>
                <button type="submit" class="btn-primary">Login</button>
                <div id="loginError" class="error-text"></div>
            </form>
        </div>
    </div>'''

new_login_html = '''    <!-- Login Screen -->
    <div id="loginScreen" class="login-container">
        <div class="login-box">
            <img src="images/maharaj_agrasen.png" alt="Logo" class="login-logo">
            <h2>Admin Login</h2>
            
            <div id="phoneSection">
                <div style="display: flex; gap: 10px;">
                    <input type="tel" id="adminPhone" placeholder="Mobile Number (e.g. 9876543210)" required pattern="[0-9]{10}" maxlength="10" style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; width: 100%; outline: none;">
                    <button type="button" class="btn-primary" id="btnSendOtp" style="white-space: nowrap; padding: 0 20px;">Send OTP</button>
                </div>
                <div id="recaptcha-container" style="margin-top: 15px;"></div>
            </div>

            <div id="otpSection" style="display:none; margin-top: 15px;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="adminOtp" placeholder="6-digit OTP" maxlength="6" style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; width: 100%; outline: none; letter-spacing: 5px; text-align: center; font-size: 18px; font-weight: bold;">
                    <button type="button" class="btn-primary" id="btnVerifyOtp" style="white-space: nowrap; padding: 0 20px;">Verify</button>
                </div>
            </div>

            <div id="loginError" class="error-text" style="margin-top: 15px;"></div>
        </div>
    </div>'''

html = html.replace(old_login_html, new_login_html)

# Also add firebase module to admin.html
if '<script src="admin.js?v=98"></script>' in html:
    new_script = '''<script src="admin.js?v=98"></script>
    <script type="module">
        import { auth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from './firebase_auth.js';
        window.firebaseAuth = auth;
        window.RecaptchaVerifier = RecaptchaVerifier;
        window.signInWithPhoneNumber = signInWithPhoneNumber;
        window.onAuthStateChanged = onAuthStateChanged;
        window.signOut = signOut;
    </script>'''
    html = html.replace('<script src="admin.js?v=98"></script>', new_script)

with open(path_html, 'w', encoding='utf-8') as f:
    f.write(html)
print("admin.html patched")


path_js = 'admin.js'
with open(path_js, 'r', encoding='utf-8') as f:
    js = f.read()

old_login_js = '''let sessionPassword = "";
window.memberData = []; // Store fetched members for quick access
window.donationData = []; // Store fetched donations
window.bookingData = []; // Store fetched bookings
window.expenseData = []; // Store fetched expenses
window.galleryData = []; // Store fetched gallery photos
window.eventData = []; // Store fetched events

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
});'''

new_login_js = '''let sessionPassword = "admin"; // Hardcoded backend password since frontend is secured via OTP
window.memberData = [];
window.donationData = [];
window.bookingData = [];
window.expenseData = [];
window.galleryData = [];
window.eventData = [];

// ADMIN ALLOWLIST: Add the testing phone numbers (or real admin numbers) here. Must include +91.
const ADMIN_PHONE_NUMBERS = [
    "+911111111111" // <--- Update this to your testing number
];

let confirmationResult = null;

// Wait for Firebase to load from module
setTimeout(() => {
    if (window.onAuthStateChanged) {
        window.onAuthStateChanged(window.firebaseAuth, (user) => {
            if (user) {
                // Check if they are an admin
                if (ADMIN_PHONE_NUMBERS.includes(user.phoneNumber)) {
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('dashboardScreen').style.display = 'flex';
                    document.getElementById('statsContainer').style.display = 'flex';
                    fetchAdminData();
                } else {
                    document.getElementById('loginError').innerText = "Access Denied: You are not an authorized Admin.";
                    window.signOut(window.firebaseAuth);
                }
            }
        });
    }

    const btnSendOtp = document.getElementById('btnSendOtp');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');

    if(btnSendOtp) {
        btnSendOtp.addEventListener('click', () => {
            const phone = document.getElementById('adminPhone').value.trim();
            if (phone.length !== 10) {
                document.getElementById('loginError').innerText = "Enter valid 10-digit number";
                return;
            }
            
            const formatted = "+91" + phone;
            btnSendOtp.disabled = true;
            btnSendOtp.innerHTML = "Sending...";
            document.getElementById('loginError').innerText = "";

            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new window.RecaptchaVerifier(window.firebaseAuth, 'recaptcha-container', {
                    'size': 'normal',
                    'callback': (response) => {},
                    'expired-callback': () => { document.getElementById('loginError').innerText = "reCAPTCHA expired. Try again."; }
                });
            }

            window.signInWithPhoneNumber(window.firebaseAuth, formatted, window.recaptchaVerifier)
                .then((result) => {
                    confirmationResult = result;
                    document.getElementById('phoneSection').style.display = 'none';
                    document.getElementById('otpSection').style.display = 'block';
                }).catch((error) => {
                    console.error(error);
                    document.getElementById('loginError').innerText = "Failed to send OTP.";
                    btnSendOtp.disabled = false;
                    btnSendOtp.innerHTML = "Send OTP";
                });
        });
    }

    if(btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', () => {
            const code = document.getElementById('adminOtp').value.trim();
            if (code.length !== 6) return;
            
            btnVerifyOtp.disabled = true;
            btnVerifyOtp.innerHTML = "Verifying...";
            
            confirmationResult.confirm(code).then((result) => {
                const user = result.user;
                if (ADMIN_PHONE_NUMBERS.includes(user.phoneNumber)) {
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('dashboardScreen').style.display = 'flex';
                    document.getElementById('statsContainer').style.display = 'flex';
                    fetchAdminData();
                } else {
                    document.getElementById('loginError').innerText = "Access Denied: You are not an authorized Admin.";
                    window.signOut(window.firebaseAuth);
                    btnVerifyOtp.disabled = false;
                    btnVerifyOtp.innerHTML = "Verify";
                }
            }).catch((error) => {
                document.getElementById('loginError').innerText = "Invalid OTP";
                btnVerifyOtp.disabled = false;
                btnVerifyOtp.innerHTML = "Verify";
            });
        });
    }
}, 500);

function fetchAdminData() {
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_members&password=${encodeURIComponent(sessionPassword)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.exportUrl) window.downloadExcelUrl = data.exportUrl;
                window.memberData = data.members || [];
                renderMembers();
            } else {
                Swal.fire("Error", data.error || "Failed to load admin data", "error");
            }
        });
}'''

js = js.replace(old_login_js, new_login_js)

# Replace logout function
old_logout = '''function logout() {
    sessionPassword = "";
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
}'''
new_logout = '''function logout() {
    if(window.firebaseAuth) {
        window.signOut(window.firebaseAuth).then(() => {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}'''
js = js.replace(old_logout, new_logout)

with open(path_js, 'w', encoding='utf-8') as f:
    f.write(js)
print("admin.js patched")
