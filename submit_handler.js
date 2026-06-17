// Helper to read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
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
                // Generate Randomized ID (Since there is no database)
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                const membershipNo = `ASS-${year}${month}${day}-${randomString}`;

                const dataObj = {}; 
                
                // Text fields
                const textFields = ['title-dropdown', 'fullName', 'guardianName', 'dob', 'bloodGroup', 'gotra', 
                                    'occupation', 'education', 'domicile', 'permanentAddress', 'officeAddress', 
                                    'houseType', 'mobileNumber', 'emailId', 'familyDetails', 'transactionId', 
                                    'utrNo', 'bankAccountName'];
                
                textFields.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        const name = id === 'title-dropdown' ? 'title' : id;
                        dataObj[name] = el.value;
                    }
                });

                // Read Images (Photos)
                const applicantPhotoInput = document.getElementById('applicantPhoto');
                const applicantSignatureInput = document.getElementById('applicantSignature');
                
                const photoUrl = applicantPhotoInput.files.length > 0 ? await readFileAsDataURL(applicantPhotoInput.files[0]) : null;
                const signatureUrl = applicantSignatureInput.files.length > 0 ? await readFileAsDataURL(applicantSignatureInput.files[0]) : null;

                // Generate Local PDFs and Download
                generateReceiptPDF(membershipNo, dataObj, 'save');
                await generateFilledTemplate(membershipNo, dataObj, photoUrl, signatureUrl, 'save');

                // Alert User
                alert(`Forms Generated Successfully!\nYour Membership No. is: ${membershipNo}\n\nIMPORTANT: Both the Receipt and Membership Form PDFs have been automatically downloaded to your computer/phone.\n\nSince there is no backend server to save these, YOU MUST MANUALLY EMAIL both of these downloaded PDFs to: atriyanshagr@gmail.com for Admin Approval!`);
                
                form.reset();

            } catch (error) {
                console.error("Error submitting form:", error);
                alert("An error occurred while generating the PDFs. Please try again.");
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
