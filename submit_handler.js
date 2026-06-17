document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('membershipForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            try {
                // Collect Form Data
                const formData = new FormData();
                
                // Text fields
                const textFields = ['title-dropdown', 'fullName', 'guardianName', 'dob', 'bloodGroup', 'gotra', 
                                    'occupation', 'education', 'domicile', 'permanentAddress', 'officeAddress', 
                                    'houseType', 'mobileNumber', 'emailId', 'familyDetails', 'transactionId', 
                                    'utrNo', 'bankAccountName'];
                
                textFields.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        // For title-dropdown we send it as 'title'
                        const name = id === 'title-dropdown' ? 'title' : id;
                        formData.append(name, el.value);
                    }
                });

                // File fields
                const applicantPhoto = document.getElementById('applicantPhoto').files[0];
                if(applicantPhoto) formData.append('applicantPhoto', applicantPhoto);

                const applicantSignature = document.getElementById('applicantSignature').files[0];
                if(applicantSignature) formData.append('applicantSignature', applicantSignature);

                const paymentScreenshot = document.getElementById('paymentScreenshot').files[0];
                if(paymentScreenshot) formData.append('paymentScreenshot', paymentScreenshot);

                // Send to Backend API
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`Form Submitted Successfully!\nYour Membership No. is: ${result.membershipNo}\n\nYour application has been sent for admin review.`);
                    form.reset();
                } else {
                    alert(`Submission failed: ${result.error || 'Unknown error'}`);
                }

            } catch (error) {
                console.error("Error submitting form:", error);
                alert("An error occurred while communicating with the server. Please check if the backend is running.");
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});
