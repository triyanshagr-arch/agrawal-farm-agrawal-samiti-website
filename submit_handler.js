// Helper to read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

// Helper to compress image
function compressImageAsBase64(file, maxWidth = 150) {
    return new Promise((resolve) => {
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress highly (0.4 quality jpeg) to fit in Google Sheets cell limit (50k chars)
                resolve(canvas.toDataURL('image/jpeg', 0.4));
            };
            img.onerror = () => resolve(null);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

// Helper to format date as DD/MM/YYYY
function formatDateDDMMYYYY(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // YYYY-MM-DD -> DD/MM/YYYY
    }
    return dateString;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('membershipForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            const currentLang = localStorage.getItem('preferredLang');
            const btnText = currentLang === 'hi' ? 'फ़ॉर्म सबमिट हो गया' : 'Form Submitted';
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${btnText}`;
            submitBtn.disabled = true;

            try {
                // Generate Randomized ID
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                const membershipNo = `ASS-${year}${month}${day}-${randomString}`;

                const dataObj = {}; 
                
                // Text fields (removed familyDetails, added marriageDate)
                const textFields = ['title-dropdown', 'fullName', 'guardianName', 'dob', 'marriageDate', 'bloodGroup', 'gotra', 
                                    'occupation', 'education', 'domicile', 'permanentAddress', 'officeAddress', 
                                    'houseType', 'mobileNumber', 'emailId', 'transactionId', 
                                    'utrNo', 'bankAccountName'];
                
                textFields.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        const name = id === 'title-dropdown' ? 'title' : id;
                        dataObj[name] = el.value;
                    }
                });

                // Handle Cash Payment Logic
                const paymentMode = document.getElementById('paymentMode') ? document.getElementById('paymentMode').value : '';
                dataObj.paymentMode = paymentMode;
                if (paymentMode === 'Cash') {
                    dataObj.transactionId = 'CASH / PENDING';
                    dataObj.bankAccountName = 'NA';
                    dataObj.utrNo = 'NA';
                }

                // Format Main Dates
                dataObj.dob = formatDateDDMMYYYY(dataObj.dob);
                dataObj.marriageDate = formatDateDDMMYYYY(dataObj.marriageDate);

                // Extract Family Details Table
                dataObj.familyMembers = [];
                const familyRows = document.querySelectorAll('#familyTable tbody tr');
                familyRows.forEach(row => {
                    const name = row.querySelector('.fam-name').value;
                    if(name.trim() !== '') { // Only add if name is not empty
                        dataObj.familyMembers.push({
                            name: name,
                            relationship: row.querySelector('.fam-rel').value,
                            dob: formatDateDDMMYYYY(row.querySelector('.fam-dob').value),
                            maritalStatus: row.querySelector('.fam-marital').value,
                            education: row.querySelector('.fam-edu').value,
                            business: row.querySelector('.fam-bus').value
                        });
                    }
                });

                // Read Images (Photos)
                const applicantPhotoInput = document.getElementById('applicantPhoto');
                const applicantSignatureInput = document.getElementById('applicantSignatureDeclaration');
                
                const photoUrl = applicantPhotoInput.files.length > 0 ? await readFileAsDataURL(applicantPhotoInput.files[0]) : null;
                const compressedPhotoBase64 = applicantPhotoInput.files.length > 0 ? await compressImageAsBase64(applicantPhotoInput.files[0]) : null;
                const isDigitallySigned = applicantSignatureInput ? applicantSignatureInput.checked : false;
                const signatureUrl = isDigitallySigned ? 'DIGITAL_VERIFIED' : null;
                const compressedSignatureBase64 = isDigitallySigned ? "DIGITAL_VERIFIED" : null;

                // Read Payment Screenshot
                const paymentScreenshotInput = document.getElementById('paymentScreenshot');
                const compressedScreenshotBase64 = paymentScreenshotInput && paymentScreenshotInput.files.length > 0 
                    ? await compressImageAsBase64(paymentScreenshotInput.files[0]) 
                    : null;

                if (compressedScreenshotBase64) {
                    // Append it to transactionId to bypass Google Sheet column restrictions
                    dataObj.transactionId = (dataObj.transactionId || '') + '|||' + compressedScreenshotBase64;
                }

                // Send data to Google Sheets in the background
                const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwX_fpplez9K2xCMCmneY7uT0j-HPb1zoX0yU_TisVioKx4Lb63qXK1qjYRx87FrNHe/exec";
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'add_membership', data: { membershipNo: membershipNo, photoBase64: compressedPhotoBase64, signatureBase64: compressedSignatureBase64, ...dataObj } })
                }).catch(err => console.error("Sheets Error:", err));

                // Generate Local PDFs and Download (Only Receipt)
                if (paymentMode !== 'Cash') {
                    await generateReceiptPDF(membershipNo, dataObj, 'save');
                }

                // Alert User
                const isHi = localStorage.getItem('preferredLang') === 'hi';
                const successTitle = isHi ? 'सफलतापूर्वक सबमिट किया गया' : 'Submitted Successfully';
                const successText = isHi ? 'फ़ॉर्म सफलतापूर्वक सबमिट हो गया है। कृपया व्यवस्थापक की स्वीकृति और ईमेल की प्रतीक्षा करें।' : 'Form submitted successfully. Please wait for admin approval and email.';
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: successTitle,
                        text: successText,
                        confirmButtonColor: '#d32f2f'
                    });
                } else {
                    alert(successText);
                }

                form.reset();

            } catch (error) {
                console.error("Error generating forms:", error);
                const isHi = localStorage.getItem('preferredLang') === 'hi';
                const errorMsg = isHi ? 'फ़ॉर्म जनरेट करते समय एक त्रुटि हुई:' : 'An error occurred while submitting:';
                alert(`${errorMsg}\n` + (error.stack || error.message || error));
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }

    // Donation Form Handler
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = donationForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            const currentLang = localStorage.getItem('preferredLang');
            const btnText = currentLang === 'hi' ? 'फ़ॉर्म सबमिट हो गया' : 'Form Submitted';
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${btnText}`;
            submitBtn.disabled = true;

            try {
                // Generate Receipt ID
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                const receiptNo = `DON-${year}${month}${day}-${randomString}`;

                const dataObj = {}; 
                const textFields = ['donorName', 'mobileNumber', 'emailId', 'address', 'panNumber', 'donationAmount', 'donationPurpose', 'transactionId'];
                
                textFields.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        dataObj[id] = el.value;
                    }
                });

                // Read Image (Screenshot)
                const paymentScreenshotInput = document.getElementById('paymentScreenshot');
                const compressedScreenshotBase64 = paymentScreenshotInput.files.length > 0 ? await compressImageAsBase64(paymentScreenshotInput.files[0]) : null;

                // Send data to Google Sheets in the background
                const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwX_fpplez9K2xCMCmneY7uT0j-HPb1zoX0yU_TisVioKx4Lb63qXK1qjYRx87FrNHe/exec";
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'add_donation', data: { receiptNo: receiptNo, screenshotBase64: compressedScreenshotBase64, ...dataObj } })
                }).catch(err => console.error("Sheets Error:", err));

                // Generate Donation Receipt PDF
                generateDonationReceiptPDF(receiptNo, dataObj, 'save');

                // Alert User
                const isHi = localStorage.getItem('preferredLang') === 'hi';
                const successTitle = isHi ? 'सफलतापूर्वक सबमिट किया गया' : 'Submitted Successfully';
                const successText = isHi ? 'फ़ॉर्म सफलतापूर्वक सबमिट हो गया है। कृपया व्यवस्थापक की स्वीकृति और ईमेल की प्रतीक्षा करें।' : 'Form submitted successfully. Please wait for admin approval and email.';
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: successTitle,
                        text: successText,
                        confirmButtonColor: '#d32f2f'
                    });
                } else {
                    alert(successText);
                }
                
                donationForm.reset();
                document.getElementById('paymentScreenshotPreview').style.display = 'none';

            } catch (error) {
                console.error("Error generating receipt:", error);
                const isHi = localStorage.getItem('preferredLang') === 'hi';
                const errorMsg = isHi ? 'रसीद जनरेट करते समय एक त्रुटि हुई।' : 'An error occurred while submitting. Please try again.';
                alert(errorMsg);
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }

    // Booking Form Handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            try {
                const dataObj = {}; 
                const textFields = ['bookingName', 'bookingMobile', 'bookingEmail', 'eventType', 'facilityRequired', 'startDate', 'endDate', 'expectedGuests', 'remarks'];
                
                textFields.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        // Map specific fields for backend compatibility
                        let key = id;
                        if (id === 'bookingName') key = 'fullName';
                        if (id === 'bookingMobile') key = 'mobileNumber';
                        if (id === 'bookingEmail') key = 'emailId';
                        
                        dataObj[key] = el.value;
                    }
                });

                // Format Dates for backend mapping if needed (optional, keeping YYYY-MM-DD is often fine for backend, but we can leave as is)

                // Send data to Google Sheets in the background
                const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwX_fpplez9K2xCMCmneY7uT0j-HPb1zoX0yU_TisVioKx4Lb63qXK1qjYRx87FrNHe/exec";
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'add_booking', data: dataObj })
                }).catch(err => console.error("Sheets Error:", err));

                // Alert User
                alert(`Booking Request Submitted Successfully!\n\nThank you for choosing Agrawal Farm. We have received your request and will contact you shortly to confirm availability and discuss further details.`);
                
                bookingForm.reset();

            } catch (error) {
                console.error("Error submitting booking:", error);
                alert("An error occurred while submitting the booking request. Please try again.");
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
