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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Forms...';
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
                const applicantSignatureInput = document.getElementById('applicantSignature');
                
                const photoUrl = applicantPhotoInput.files.length > 0 ? await readFileAsDataURL(applicantPhotoInput.files[0]) : null;
                const compressedPhotoBase64 = applicantPhotoInput.files.length > 0 ? await compressImageAsBase64(applicantPhotoInput.files[0]) : null;
                const signatureUrl = applicantSignatureInput.files.length > 0 ? await readFileAsDataURL(applicantSignatureInput.files[0]) : null;

                // Send data to Google Sheets in the background
                const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIlSSNBiBm5k2SB5Ja0z--oJd-ZG8jcmawT0Wh-LsZYGF27WMnaE6a6xDsOOsiru7R/exec";
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'add_membership', data: { membershipNo: membershipNo, photoBase64: compressedPhotoBase64, ...dataObj } })
                }).catch(err => console.error("Sheets Error:", err));

                // Generate Local PDFs and Download
                if (paymentMode !== 'Cash') {
                    generateReceiptPDF(membershipNo, dataObj, 'save');
                }
                await generateFilledTemplate(membershipNo, dataObj, photoUrl, signatureUrl, 'save');

                // Alert User
                if (paymentMode === 'Cash') {
                    alert(`Application Form Downloaded Successfully!\nYour Membership No. is: ${membershipNo}\n\nIMPORTANT: Please print this application form and submit it along with your Cash payment at the Samiti Office.\n\nYour data has also been saved securely.`);
                } else {
                    alert(`Forms Generated Successfully!\nYour Membership No. is: ${membershipNo}\n\nIMPORTANT: Both the Receipt and Membership Form PDFs have been automatically downloaded to your computer/phone.\n\nYour data has been saved securely! You MUST MANUALLY EMAIL both of these downloaded PDFs to: atriyanshagr@gmail.com for Admin Approval!`);
                }
                form.reset();

            } catch (error) {
                console.error("Error generating forms:", error);
                alert("An error occurred while generating the forms:\n" + (error.stack || error.message || error));
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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Receipt...';
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
                const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIlSSNBiBm5k2SB5Ja0z--oJd-ZG8jcmawT0Wh-LsZYGF27WMnaE6a6xDsOOsiru7R/exec";
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'add_donation', data: { receiptNo: receiptNo, screenshotBase64: compressedScreenshotBase64, ...dataObj } })
                }).catch(err => console.error("Sheets Error:", err));

                // Generate Donation Receipt PDF
                generateDonationReceiptPDF(receiptNo, dataObj, 'save');

                // Alert User
                alert(`Donation Receipt Generated Successfully!\nYour Receipt No. is: ${receiptNo}\n\nIMPORTANT: The receipt has been automatically downloaded to your computer/phone. Your data has also been securely saved to the server!`);
                
                donationForm.reset();
                document.getElementById('paymentScreenshotPreview').style.display = 'none';

            } catch (error) {
                console.error("Error generating receipt:", error);
                alert("An error occurred while generating the receipt. Please try again.");
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
