// PDF Generation Logic for Membership Form

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('membershipForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDFs...';
            submitBtn.disabled = true;

            try {
                // 1. Generate Unique ID
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                const membershipNo = `ASS-${year}${month}${day}-${randomString}`;

                // 2. Collect Form Data
                const formData = {
                    title: document.getElementById('title-dropdown').value,
                    fullName: document.getElementById('fullName').value,
                    guardianName: document.getElementById('guardianName').value,
                    dob: document.getElementById('dob').value,
                    bloodGroup: document.getElementById('bloodGroup').value,
                    gotra: document.getElementById('gotra').value,
                    occupation: document.getElementById('occupation').value,
                    education: document.getElementById('education').value,
                    domicile: document.getElementById('domicile').value,
                    permanentAddress: document.getElementById('permanentAddress').value,
                    officeAddress: document.getElementById('officeAddress').value,
                    houseType: document.getElementById('houseType').value,
                    mobileNumber: document.getElementById('mobileNumber').value,
                    emailId: document.getElementById('emailId').value,
                    transactionId: document.getElementById('transactionId').value,
                    utrNo: document.getElementById('utrNo').value,
                    bankAccountName: document.getElementById('bankAccountName').value
                };

                // Read Images (Photos)
                const applicantPhotoInput = document.getElementById('applicantPhoto');
                const applicantSignatureInput = document.getElementById('applicantSignature');
                
                const applicantPhotoDataUrl = applicantPhotoInput.files.length > 0 ? await readFileAsDataURL(applicantPhotoInput.files[0]) : null;
                const applicantSignatureDataUrl = applicantSignatureInput.files.length > 0 ? await readFileAsDataURL(applicantSignatureInput.files[0]) : null;


                // 3. Generate Receipt PDF
                generateReceiptPDF(membershipNo, formData);

                // 4. Fill and Generate Template Image/PDF
                await generateFilledTemplate(membershipNo, formData, applicantPhotoDataUrl, applicantSignatureDataUrl);

                // Success Message
                alert(`Form Submitted Successfully!\nYour Membership No. is: ${membershipNo}\n\nYour PDF Receipt and Filled Form have been downloaded.`);
                form.reset();

            } catch (error) {
                console.error("Error generating PDFs:", error);
                alert("An error occurred while generating your forms:\n\n" + (error.message || error) + "\n\nPlease try again.");
            } finally {
                // Restore button
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
});

// Helper to read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

// Helper to load image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

// Generate Receipt PDF
function generateReceiptPDF(membershipNo, data, returnType = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Logo or Header
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // Primary color
    doc.text("Agrawal Samaj Samiti", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Membership Payment Receipt", 105, 30, null, null, "center");

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Details
    doc.setFontSize(12);
    let y = 50;
    
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(`Receipt Date: ${formattedToday}`, 20, y);
    doc.text(`Membership No: ${membershipNo}`, 120, y);
    y += 15;

    doc.text(`Name: ${data.title || ''} ${data.fullName || 'NA'}`, 20, y);
    y += 10;
    doc.text(`Mobile Number: ${data.mobileNumber || 'NA'}`, 20, y);
    doc.text(`Email: ${data.emailId || 'NA'}`, 120, y);
    y += 10;
    doc.text(`Membership Type: Lifetime Membership (Rs. 501/-)`, 20, y);
    
    y += 15;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 15;

    // Transaction Details
    doc.setFontSize(14);
    doc.text("Transaction Details", 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Transaction ID / Ref: ${data.transactionId || 'NA'}`, 20, y);
    y += 10;
    doc.text(`UTR No: ${data.utrNo || "NA"}`, 20, y);
    y += 10;
    doc.text(`Bank Account Name: ${data.bankAccountName || 'NA'}`, 20, y);

    y += 15;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;

    // Family Details (Briefly)
    if (data.familyMembers && data.familyMembers.length > 0) {
        doc.setFontSize(14);
        doc.text(`Family Members (${data.familyMembers.length})`, 20, y);
        y += 8;
        doc.setFontSize(10);
        data.familyMembers.forEach((m, idx) => {
            doc.text(`${idx + 1}. ${m.name} (${m.relationship}) - DOB: ${m.dob} - Edu: ${m.education}`, 20, y);
            y += 6;
        });
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 280, null, null, "center");

    if (returnType === 'save') {
        doc.save(`Receipt_${(data.fullName || 'User').replace(/\s+/g, '_')}_${membershipNo}.pdf`);
    } else if (returnType === 'datauristring') {
        return doc.output('datauristring');
    }
}

// Generate Filled Template
async function generateFilledTemplate(membershipNo, data, photoUrl, signatureUrl, returnType = 'save') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the template image
    const templateImg = await loadImage('images/membership_template.jpg');
    
    // Set canvas dimensions to match template
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    
    // Draw template
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
    
    // Setup Font
    ctx.fillStyle = '#111111';
    const fontSize = Math.floor(canvas.width * 0.015); 
    ctx.font = `bold ${fontSize}px sans-serif`;

    const cw = canvas.width;
    const ch = canvas.height;

    // Helper to draw text with NA fallback
    const drawText = (text, xPct, yPct) => {
        const val = (text && String(text).trim() !== '') ? text : 'NA';
        ctx.fillText(val, cw * xPct, ch * yPct);
    };

    // Est. Coordinates for Agrawal Farm Template
    drawText(membershipNo, 0.80, 0.04); // Top right
    
    drawText(`${data.title || ''} ${data.fullName || ''}`, 0.22, 0.198);
    drawText(data.guardianName, 0.22, 0.235);
    drawText(data.education, 0.12, 0.275);
    drawText(data.occupation, 0.45, 0.275);
    drawText(data.gotra, 0.70, 0.275);
    drawText(data.domicile, 0.12, 0.315);
    drawText(data.dob, 0.45, 0.315);
    drawText(data.marriageDate, 0.75, 0.315); // Will naturally fall back to NA
    
    drawText(data.permanentAddress ? data.permanentAddress.substring(0, 80) : '', 0.22, 0.355);
    drawText(data.mobileNumber, 0.65, 0.395);
    drawText(data.emailId, 0.12, 0.435);
    drawText(data.houseType, 0.60, 0.435);
    drawText(data.officeAddress, 0.22, 0.475);
    
    // Draw Family details Table
    ctx.font = `normal ${Math.floor(fontSize * 0.8)}px sans-serif`;
    let familyStartY = 0.58; // Start Y percentage for the first row of family table
    const rowHeight = 0.032; // Increment Y percentage per row
    
    if (data.familyMembers && Array.isArray(data.familyMembers)) {
        data.familyMembers.forEach((member, index) => {
            if (index >= 8) return; // Max 8
            const y = familyStartY + (index * rowHeight);
            drawText(String(index + 1), 0.07, y);          // S.No
            drawText(member.name, 0.13, y);                // Name
            drawText(member.dob, 0.38, y);                 // DOB
            drawText(member.education, 0.50, y);           // Education
            drawText(member.maritalStatus, 0.63, y);       // Marital
            drawText(member.relationship, 0.75, y);        // Rel
            drawText(member.business, 0.86, y);            // Business
        });
    }

    // Draw Photo
    if (photoUrl) {
        try {
            const photoImg = await loadImage(photoUrl);
            const photoX = cw * 0.80;
            const photoY = ch * 0.125;
            const photoW = cw * 0.16;
            const photoH = ch * 0.165;
            ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
        } catch(e) { console.error("Could not load photo", e); }
    }

    // Draw Signature
    if (signatureUrl) {
        try {
            const sigImg = await loadImage(signatureUrl);
            const sigX = cw * 0.75;
            const sigY = ch * 0.88;
            const sigW = cw * 0.15;
            const sigH = ch * 0.05;
            ctx.drawImage(sigImg, sigX, sigY, sigW, sigH);
        } catch(e) { console.error("Could not load signature", e); }
    }

    ctx.font = `bold ${fontSize}px sans-serif`;
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    drawText(formattedToday, 0.1, 0.90);

    // Convert Canvas to PDF
    const { jsPDF } = window.jspdf;
    const orientation = canvas.width > canvas.height ? 'l' : 'p';
    
    const doc = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    doc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    
    if (returnType === 'save') {
        doc.save(`Filled_Form_${(data.fullName || 'User').replace(/\s+/g, '_')}_${membershipNo}.pdf`);
    } else if (returnType === 'datauristring') {
        return doc.output('datauristring');
    }
}

// Generate Donation Receipt PDF
function generateDonationReceiptPDF(receiptNo, data, returnType = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Setup basic styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // Primary Red
    doc.text("AGRAWAL SAMAJ SAMITI", 105, 20, null, null, "center");

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Agrawal Farm, Mansarovar, Jaipur (Reg.)", 105, 28, null, null, "center");

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("DONATION RECEIPT", 105, 45, null, null, "center");

    // Meta details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 60;
    
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(`Receipt Date: ${formattedToday}`, 20, y);
    doc.text(`Receipt No: ${receiptNo}`, 120, y);
    y += 15;

    // Donor Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Donor Details", 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${data.donorName || 'NA'}`, 20, y);
    y += 10;
    doc.text(`Mobile: ${data.mobileNumber || 'NA'}`, 20, y);
    doc.text(`Email: ${data.emailId || 'NA'}`, 120, y);
    y += 10;
    doc.text(`PAN: ${data.panNumber || 'NA'}`, 20, y);
    y += 10;
    
    // Address handling (multiline)
    doc.text(`Address:`, 20, y);
    const addressLines = doc.splitTextToSize(data.address || 'NA', 140);
    doc.text(addressLines, 45, y);
    y += (addressLines.length * 6) + 10;

    // Donation Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Donation Details", 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Amount: Rs. ${data.donationAmount || '0'} /-`, 20, y);
    y += 10;
    doc.text(`Purpose: ${data.donationPurpose || 'NA'}`, 20, y);
    y += 10;
    doc.text(`Transaction ID / UTR: ${data.transactionId || 'NA'}`, 20, y);
    y += 20;

    // Footer & Thank you
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 15;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.setTextColor(220, 53, 69);
    doc.text("Thank you for your generous contribution!", 105, y, null, null, "center");
    
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("May the blessings of Shri Maharaja Agrasen be with you always.", 105, y, null, null, "center");

    // Bottom Notice
    doc.setFontSize(10);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 280, null, null, "center");

    // Output
    if (returnType === 'save') {
        doc.save(`Donation_Receipt_${(data.donorName || 'Donor').replace(/\s+/g, '_')}_${receiptNo}.pdf`);
    } else if (returnType === 'datauristring') {
        return doc.output('datauristring');
    }
}
