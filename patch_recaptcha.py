import re

path = 'sadasyata.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_script = '''        // Setup Recaptcha
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

            signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier)'''

new_script = '''        // Setup Recaptcha lazily
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

            signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier)'''

if old_script in content:
    content = content.replace(old_script, new_script)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Old script not found")
