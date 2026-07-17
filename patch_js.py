import re

path = 'sadasyata.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_js = '''
    <!-- Firebase Phone Auth for Form -->
    <script type="module">
        import { auth, RecaptchaVerifier, signInWithPhoneNumber } from './firebase_auth.js';

        let confirmationResult = null;
        let isPhoneVerified = false;

        const mobileInput = document.getElementById('mobileNumber');
        const btnSendOtp = document.getElementById('btnSendOtp');
        const otpSection = document.getElementById('otpSection');
        const otpInput = document.getElementById('otpInput');
        const btnVerifyOtp = document.getElementById('btnVerifyOtp');
        const phoneStatus = document.getElementById('phoneStatus');
        const submitButton = document.getElementById('submitButton');
        const submitLockIcon = document.getElementById('submitLockIcon');

        // Allow user to change number, resets verification
        if (mobileInput) {
            mobileInput.addEventListener('input', () => {
                if (isPhoneVerified) {
                    isPhoneVerified = false;
                    phoneStatus.style.display = 'none';
                    btnSendOtp.style.display = 'block';
                    btnSendOtp.innerText = 'Verify SMS';
                    mobileInput.style.borderColor = '#ddd';
                    mobileInput.readOnly = false;
                    
                    // Disable submit button
                    if(submitButton) {
                        submitButton.disabled = true;
                        submitButton.style.backgroundColor = '#ccc';
                        submitButton.style.cursor = 'not-allowed';
                        submitButton.style.boxShadow = 'none';
                        submitButton.style.color = '#666';
                        if(submitLockIcon) submitLockIcon.className = 'fas fa-lock';
                        const hi = submitButton.querySelector('.lang-hi');
                        if(hi) hi.innerText = 'फॉर्म जमा करें (पहले फोन वेरीफाई करें)';
                        const en = submitButton.querySelector('.lang-en');
                        if(en) en.innerText = 'Submit Form (Verify Phone First)';
                    }
                }
            });
        }

        // Setup Recaptcha lazily
        function initRecaptcha() {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'normal',
                    'callback': (response) => {
                        // reCAPTCHA solved
                    },
                    'expired-callback': () => {
                        Swal.fire('Error', 'reCAPTCHA expired. Please try again.', 'error');
                    }
                });
            }
        }

        if (btnSendOtp) {
            btnSendOtp.addEventListener('click', () => {
                const phoneNumber = mobileInput.value.trim();
                if (phoneNumber.length !== 10) {
                    Swal.fire('Error', 'Please enter a valid 10-digit mobile number.', 'error');
                    return;
                }

                const formattedNumber = '+91' + phoneNumber;
                btnSendOtp.disabled = true;
                btnSendOtp.innerText = 'Sending...';

                initRecaptcha();

                signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier)
                    .then((result) => {
                        confirmationResult = result;
                        otpSection.style.display = 'block';
                        btnSendOtp.style.display = 'none';
                        document.getElementById('recaptcha-container').style.display = 'none';
                        Swal.fire('Sent!', 'OTP has been sent to your phone via SMS.', 'success');
                    }).catch((error) => {
                        console.error("SMS Error:", error);
                        btnSendOtp.disabled = false;
                        btnSendOtp.innerText = 'Verify SMS';
                        window.recaptchaVerifier.render().then(function(widgetId) {
                            grecaptcha.reset(widgetId);
                        });
                        Swal.fire('Error', 'Failed to send OTP. Please check your number and try again.', 'error');
                    });
            });
        }

        if (btnVerifyOtp) {
            btnVerifyOtp.addEventListener('click', () => {
                const code = otpInput.value.trim();
                if (code.length !== 6) {
                    Swal.fire('Error', 'Please enter a valid 6-digit OTP.', 'error');
                    return;
                }

                btnVerifyOtp.disabled = true;
                btnVerifyOtp.innerText = 'Verifying...';

                confirmationResult.confirm(code).then((result) => {
                    // User signed in successfully
                    isPhoneVerified = true;
                    otpSection.style.display = 'none';
                    
                    // Show success status next to phone input
                    phoneStatus.innerHTML = '<i class="fas fa-check-circle"></i> Phone Verified Successfully';
                    phoneStatus.style.color = '#2e7d32';
                    phoneStatus.style.display = 'block';
                    mobileInput.style.borderColor = '#2e7d32';
                    mobileInput.readOnly = true;

                    // Enable Submit Button
                    if(submitButton) {
                        submitButton.disabled = false;
                        submitButton.style.backgroundColor = 'var(--primary-color)';
                        submitButton.style.cursor = 'pointer';
                        submitButton.style.boxShadow = '0 5px 15px rgba(220,53,69,0.3)';
                        submitButton.style.color = '#fff';
                        if(submitLockIcon) submitLockIcon.className = 'fas fa-paper-plane';
                        const hi = submitButton.querySelector('.lang-hi');
                        if(hi) hi.innerText = 'फॉर्म जमा करें';
                        const en = submitButton.querySelector('.lang-en');
                        if(en) en.innerText = 'Submit Form';
                    }

                    Swal.fire('Verified!', 'Your phone number has been verified successfully.', 'success');

                }).catch((error) => {
                    console.error("OTP Error:", error);
                    btnVerifyOtp.disabled = false;
                    btnVerifyOtp.innerText = 'Confirm';
                    Swal.fire('Error', 'Invalid OTP. Please try again.', 'error');
                });
            });
        }

        // Intercept form submission to double check
        const form = document.getElementById('membershipForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                if (!isPhoneVerified) {
                    e.preventDefault();
                    e.stopImmediatePropagation(); // Ensure it stops submit_handler.js from firing too!
                    Swal.fire('Verification Required', 'Please verify your phone number via SMS before submitting the form.', 'warning');
                }
            }, true); // Use capture phase so this runs BEFORE submit_handler.js
        }

    </script>
</body>
'''

if '</body>' in content:
    content = content.replace('</body>', new_js)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected Firebase JS successfully")
else:
    print("Could not find </body>")
