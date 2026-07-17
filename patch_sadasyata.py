import re

path = 'sadasyata.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the Mobile Number group
old_mobile = '''                            <div class="form-group">
                                <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #333;"><span class="lang-hi">मोबाइल नंबर <span style="color:red">*</span></span><span class="lang-en">Mobile Number <span style="color:red">*</span></span></label>
                                <input type="tel" id="mobileNumber" required pattern="[0-9]{10}" maxlength="10" title="Please enter exactly 10 digits" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; transition: 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='#ddd'">
                            </div>'''

new_mobile = '''                            <div class="form-group" style="position: relative;">
                                <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #333;"><span class="lang-hi">मोबाइल नंबर <span style="color:red">*</span></span><span class="lang-en">Mobile Number <span style="color:red">*</span></span></label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="tel" id="mobileNumber" required pattern="[0-9]{10}" maxlength="10" title="Please enter exactly 10 digits" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; transition: 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='#ddd'">
                                    <button type="button" id="btnSendOtp" class="btn" style="background: #e0e0e0; color: #333; border: none; white-space: nowrap; padding: 0 20px; border-radius: 8px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#d0d0d0'" onmouseout="this.style.background='#e0e0e0'">Verify SMS</button>
                                </div>
                                <div id="otpSection" style="display: none; margin-top: 10px;">
                                    <div style="display: flex; gap: 10px;">
                                        <input type="text" id="otpInput" placeholder="Enter 6-digit OTP" maxlength="6" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box;">
                                        <button type="button" id="btnVerifyOtp" class="btn btn-primary" style="white-space: nowrap; padding: 0 20px; border-radius: 8px; border: none; cursor: pointer;">Confirm</button>
                                    </div>
                                </div>
                                <div id="recaptcha-container" style="margin-top: 10px;"></div>
                                <div id="phoneStatus" style="margin-top: 5px; font-size: 0.9em; font-weight: bold; display: none;"></div>
                            </div>'''
content = content.replace(old_mobile, new_mobile)

# 2. Replace the Submit Button
old_submit = '''                <button type="submit" id="submitButton" class="btn btn-primary" style="padding: 15px 40px; font-size: 1.2rem; border: none; cursor: pointer; box-shadow: 0 5px 15px rgba(220,53,69,0.3);"><i class="fas fa-paper-plane"></i> <span class="lang-hi">फॉर्म जमा करें</span><span class="lang-en">Submit Form</span></button>'''

new_submit = '''                <button type="submit" id="submitButton" class="btn" disabled style="padding: 15px 40px; font-size: 1.2rem; border: none; cursor: not-allowed; background-color: #ccc; box-shadow: none; color: #666; transition: 0.3s;"><i class="fas fa-lock" id="submitLockIcon"></i> <span class="lang-hi">फॉर्म जमा करें (पहले फोन वेरीफाई करें)</span><span class="lang-en">Submit Form (Verify Phone First)</span></button>'''
content = content.replace(old_submit, new_submit)

# 3. Inject JS at bottom
old_js = '''    <script src="submit_handler.js"></script>
</body>'''

new_js = '''    <script src="submit_handler.js"></script>

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
        mobileInput.addEventListener('input', () => {
            if (isPhoneVerified) {
                isPhoneVerified = false;
                phoneStatus.style.display = 'none';
                btnSendOtp.style.display = 'block';
                btnSendOtp.innerText = 'Verify SMS';
                mobileInput.style.borderColor = '#ddd';
                mobileInput.readOnly = false;
                
                // Disable submit button
                submitButton.disabled = true;
                submitButton.style.backgroundColor = '#ccc';
                submitButton.style.cursor = 'not-allowed';
                submitButton.style.boxShadow = 'none';
                submitButton.style.color = '#666';
                submitLockIcon.className = 'fas fa-lock';
                submitButton.querySelector('.lang-hi').innerText = 'फॉर्म जमा करें (पहले फोन वेरीफाई करें)';
                submitButton.querySelector('.lang-en').innerText = 'Submit Form (Verify Phone First)';
            }
        });

        // Setup Recaptcha
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'normal',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                Swal.fire('Error', 'reCAPTCHA expired. Please try again.', 'error');
            }
        });

        btnSendOtp.addEventListener('click', () => {
            const phoneNumber = mobileInput.value.trim();
            if (phoneNumber.length !== 10) {
                Swal.fire('Error', 'Please enter a valid 10-digit mobile number.', 'error');
                return;
            }

            const formattedNumber = '+91' + phoneNumber;
            btnSendOtp.disabled = true;
            btnSendOtp.innerText = 'Sending...';

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
                submitButton.disabled = false;
                submitButton.style.backgroundColor = 'var(--primary-color)';
                submitButton.style.cursor = 'pointer';
                submitButton.style.boxShadow = '0 5px 15px rgba(220,53,69,0.3)';
                submitButton.style.color = '#fff';
                submitLockIcon.className = 'fas fa-paper-plane';
                submitButton.querySelector('.lang-hi').innerText = 'फॉर्म जमा करें';
                submitButton.querySelector('.lang-en').innerText = 'Submit Form';

                Swal.fire('Verified!', 'Your phone number has been verified successfully.', 'success');

            }).catch((error) => {
                console.error("OTP Error:", error);
                btnVerifyOtp.disabled = false;
                btnVerifyOtp.innerText = 'Confirm';
                Swal.fire('Error', 'Invalid OTP. Please try again.', 'error');
            });
        });

        // Intercept form submission to double check
        document.getElementById('membershipForm').addEventListener('submit', function(e) {
            if (!isPhoneVerified) {
                e.preventDefault();
                Swal.fire('Verification Required', 'Please verify your phone number via SMS before submitting the form.', 'warning');
            }
        });

    </script>
</body>'''
content = content.replace(old_js, new_js)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
