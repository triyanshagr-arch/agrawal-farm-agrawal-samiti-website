import re

with open('submit_handler.js', 'r', encoding='utf-8') as f:
    js = f.read()

# We need to find the matrimonial form submission block and insert the fetch call.
# The block looks like:
# if (typeof window.generateMatrimonialPDF === 'function') {
#     const pdfBlob = await window.generateMatrimonialPDF(formData);
# 
#     if (pdfBlob) {
#         Swal.fire({

fetch_code = '''
                // Send data to backend
                try {
                    const formDataObj = new FormData();
                    formDataObj.append('action', 'submit_matrimonial');
                    formDataObj.append('name', formData.name);
                    formDataObj.append('gender', formData.gender);
                    formDataObj.append('dob', formData.dob);
                    formDataObj.append('height', formData.height);
                    formDataObj.append('gotra', formData.gotra);
                    formDataObj.append('manglik', formData.manglik);
                    formDataObj.append('education', formData.education);
                    formDataObj.append('profession', formData.profession);
                    formDataObj.append('income', formData.income);
                    formDataObj.append('father', formData.father);
                    formDataObj.append('mother', formData.mother);
                    formDataObj.append('address', formData.address);
                    formDataObj.append('mobile', formData.mobile);
                    formDataObj.append('photo', formData.photo || '');

                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: formDataObj
                    });
                } catch (err) {
                    console.error('Failed to save to backend:', err);
                }

                if (typeof window.generateMatrimonialPDF === 'function') {
'''

js = js.replace("if (typeof window.generateMatrimonialPDF === 'function') {", fetch_code)

with open('submit_handler.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated submit_handler.js")
