import re

with open('submit_handler.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add recaptcha validation after e.preventDefault()
validation_code = '''e.preventDefault();
            if (typeof grecaptcha !== 'undefined') {
                if (!grecaptcha.getResponse()) {
                    const isHi = localStorage.getItem('preferredLang') === 'hi';
                    alert(isHi ? "कृपया पुष्टि करें कि आप रोबोट नहीं हैं।" : "Please confirm you are not a robot.");
                    return;
                }
            }'''
js = js.replace('e.preventDefault();', validation_code)

# 2. Attach recaptcha token to dataObj
js = js.replace('const dataObj = {};', 'const dataObj = {};\n                if (typeof grecaptcha !== \'undefined\') dataObj.recaptchaToken = grecaptcha.getResponse();')

# 3. Attach recaptcha token to matrimonial FormData
matrimonial_token = '''formDataObj.append('photo', formData.photo || '');
                    if (typeof grecaptcha !== 'undefined') formDataObj.append('recaptchaToken', grecaptcha.getResponse());'''
js = js.replace("formDataObj.append('photo', formData.photo || '');", matrimonial_token)

# 4. Reset recaptcha in finally block
reset_code = '''submitBtn.disabled = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();'''
js = js.replace('submitBtn.disabled = false;', reset_code)

with open('submit_handler.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("submit_handler.js updated.")
