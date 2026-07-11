import os

code_gs_path = r'C:\Users\us\.gemini\antigravity\brain\52d51e61-096e-4653-a719-ab8c0f3886dc\Code.gs'
with open(code_gs_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add SECRET and verify function
secret_code = '''const RECAPTCHA_SECRET = "6LcNtE0tAAAAADBS6Od6gbQwncGDpvgrrpG44epq";

function verifyRecaptcha(token) {
  if (!token) return false;
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const payload = {
    'secret': RECAPTCHA_SECRET,
    'response': token
  };
  const options = {
    'method': 'post',
    'payload': payload
  };
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  return json.success;
}
'''
code = code.replace('function doGet(e) {', secret_code + '\nfunction doGet(e) {')

# 2. Add validation to add_membership
code = code.replace('if (action === "add_membership") {', 'if (action === "add_membership") {\n      if (!verifyRecaptcha(data.data.recaptchaToken)) return respond({ success: false, error: "reCAPTCHA verification failed." });')

# 3. Add validation to add_donation
code = code.replace('if (action === "add_donation") {', 'if (action === "add_donation") {\n      if (!verifyRecaptcha(data.data.recaptchaToken)) return respond({ success: false, error: "reCAPTCHA verification failed." });')

# 4. Add validation to add_booking
code = code.replace('if (action === "add_booking") {', 'if (action === "add_booking") {\n      if (!verifyRecaptcha(data.data.recaptchaToken)) return respond({ success: false, error: "reCAPTCHA verification failed." });')

# 5. Add validation to submit_matrimonial
code = code.replace('if (action === "submit_matrimonial") {', 'if (action === "submit_matrimonial") {\n      if (!verifyRecaptcha(data.recaptchaToken)) return respond({ status: "error", message: "reCAPTCHA verification failed." });')

with open(code_gs_path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Code.gs updated successfully.')
