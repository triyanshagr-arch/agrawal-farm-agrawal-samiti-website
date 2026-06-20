// PDF Generation Logic for Membership Form



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
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

// Generate Receipt PDF
async function generateReceiptPDF(membershipNo, data, returnType = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a5', orientation: 'portrait' });

    // Draw beautiful double border
    doc.setDrawColor(211, 47, 47); // Red
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200);
    doc.setDrawColor(255, 215, 0); // Gold
    doc.setLineWidth(0.5);
    doc.rect(7, 7, 134, 196);

    // Try loading Header Images
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        doc.addImage(agrasenImg, 'PNG', 10, 10, 18, 24); // Top left
        const lakshmiImg = await loadImage('images/lakshmi.png');
        doc.addImage(lakshmiImg, 'PNG', 120, 10, 18, 24); // Top right
    } catch(e) { console.error("Images failed to load", e); }

    // Setup basic styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47); // Primary Red
    doc.text("AGRAWAL SAMAJ SAMITI", 74, 18, null, null, "center");

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Agrawal Farm, Mansarovar, Jaipur (Reg.)", 74, 24, null, null, "center");
    
    doc.setFontSize(7);
    doc.text("Email: assagarwalfarmjpr@gmail.com | Phone: +91 9829220486", 74, 29, null, null, "center");
    doc.setTextColor(211, 47, 47);
    doc.text("Registration No: 169/93-94", 74, 34, null, null, "center");

    doc.setDrawColor(211, 47, 47);
    doc.setLineWidth(0.5);
    doc.line(10, 40, 138, 40);

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("MEMBERSHIP RECEIPT", 74, 48, null, null, "center");

    // Meta details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let y = 58;
    
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(`Receipt Date: ${formattedToday}`, 12, y);
    doc.text(`Membership No: ${membershipNo}`, 85, y);
    y += 10;

    // Member Details
    doc.setFillColor(255, 243, 243);
    doc.rect(10, y-4, 128, 6, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text("Member Details", 12, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Name: ${data.title || ''} ${data.fullName || 'NA'}`, 12, y);
    y += 6;
    doc.text(`Mobile: ${data.mobileNumber || 'NA'}`, 12, y);
    doc.text(`Email: ${data.emailId || 'NA'}`, 75, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Membership Type: Lifetime Membership (Rs. 501/-)`, 12, y);
    doc.setFont("helvetica", "normal");
    
    y += 10;

    // Transaction Details
    doc.setFillColor(255, 243, 243);
    doc.rect(10, y-4, 128, 6, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text("Transaction Details", 12, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    let printTxId = data.transactionId || 'NA';
    if (String(printTxId).includes('|||')) printTxId = String(printTxId).split('|||')[0];
    doc.text(`Transaction ID / Ref: ${printTxId}`, 12, y);
    y += 6;
    doc.text(`UTR No: ${data.utrNo || "NA"}`, 12, y);
    y += 6;
    doc.text(`Bank Account Name: ${data.bankAccountName || 'NA'}`, 12, y);

    y += 10;

    // Family Details
    if (data.familyMembers && data.familyMembers.length > 0) {
        doc.setFillColor(255, 243, 243);
        doc.rect(10, y-4, 128, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(211, 47, 47);
        doc.text(`Family Members (${data.familyMembers.length})`, 12, y);
        y += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        data.familyMembers.forEach((m, idx) => {
            doc.text(`${idx + 1}. ${m.name} (${m.relationship}) - DOB: ${m.dob} - Edu: ${m.education}`, 12, y);
            y += 6;
        });
    }

    // Watermark
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.1}));
            doc.addImage(agrasenImg, 'PNG', 44, 70, 60, 78);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }
    } catch(e) {}

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 74, 202, null, null, "center");

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
    if (signatureUrl === 'DIGITAL_VERIFIED') {
        ctx.fillStyle = '#28a745';
        ctx.font = `bold ${fontSize * 1.5}px sans-serif`;
        const sigX = cw * 0.75;
        const sigY = ch * 0.90;
        ctx.fillText("✓ E-Verified", sigX, sigY);
        ctx.fillStyle = '#000000'; // reset
    } else if (signatureUrl) {
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
async function generateDonationReceiptPDF(receiptNo, data, returnType = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: 'a5', orientation: 'portrait' });

    // Draw beautiful double border
    doc.setDrawColor(211, 47, 47); // Red
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200);
    doc.setDrawColor(255, 215, 0); // Gold
    doc.setLineWidth(0.5);
    doc.rect(7, 7, 134, 196);

    // Try loading Header Images
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        doc.addImage(agrasenImg, 'PNG', 10, 10, 18, 24); // Top left
        const lakshmiImg = await loadImage('images/lakshmi.png');
        doc.addImage(lakshmiImg, 'PNG', 120, 10, 18, 24); // Top right
    } catch(e) { console.error("Images failed to load", e); }

    // Setup basic styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47); // Primary Red
    doc.text("AGRAWAL SAMAJ SAMITI", 74, 18, null, null, "center");

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Agrawal Farm, Mansarovar, Jaipur (Reg.)", 74, 24, null, null, "center");
    
    doc.setFontSize(7);
    doc.text("Email: assagarwalfarmjpr@gmail.com | Phone: +91 9829220486", 74, 29, null, null, "center");

    doc.setDrawColor(211, 47, 47);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 138, 35);

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("DONATION RECEIPT", 74, 43, null, null, "center");

    // Meta details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let y = 52;
    
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(`Receipt Date: ${formattedToday}`, 12, y);
    doc.text(`Receipt No: ${receiptNo}`, 85, y);
    y += 8;

    // Donor Details
    doc.setFillColor(255, 243, 243);
    doc.rect(10, y-4, 128, 6, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text("Donor Details", 12, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Name: ${data.donorName || 'NA'}`, 12, y);
    y += 6;
    doc.text(`Mobile: ${data.mobileNumber || 'NA'}`, 12, y);
    doc.text(`Email: ${data.emailId || 'NA'}`, 75, y);
    y += 6;
    doc.text(`PAN: ${data.panNumber || 'NA'}`, 12, y);
    y += 6;
    
    // Address handling (multiline)
    doc.text(`Address:`, 12, y);
    const addressLines = doc.splitTextToSize(data.address || 'NA', 95);
    doc.text(addressLines, 28, y);
    y += (addressLines.length * 4) + 8;

    // Donation Details
    doc.setFillColor(255, 243, 243);
    doc.rect(10, y-4, 128, 6, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text("Donation Details", 12, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Amount: Rs. ${data.donationAmount || '0'} /-`, 12, y);
    y += 6;
    doc.text(`Amount in words: Rupees ${convertNumberToWords(data.donationAmount || 0)} Only`, 12, y);
    y += 6;
    doc.text(`Purpose: ${data.donationPurpose || 'NA'}`, 12, y);
    y += 6;
    let printTxId = data.transactionId || 'NA';
    if (String(printTxId).includes('|||')) printTxId = String(printTxId).split('|||')[0];
    doc.text(`Transaction ID / UTR: ${printTxId}`, 12, y);
    y += 15;

    // Footer & Thank you
    doc.setDrawColor(211, 47, 47);
    doc.setLineWidth(0.5);
    doc.line(10, y, 138, y);
    y += 8;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(211, 47, 47);
    doc.text("Thank you for your generous contribution!", 74, y, null, null, "center");
    
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("May the blessings of Shri Maharaj Agrasen be with you always.", 74, y, null, null, "center");

    // Watermark
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.1}));
            doc.addImage(agrasenImg, 'PNG', 44, 70, 60, 78);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }
    } catch(e) {}

    // Bottom Notice
    doc.setFontSize(7);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 74, 202, null, null, "center");

    // Output
    if (returnType === 'save') {
        doc.save(`Donation_Receipt_${(data.donorName || 'Donor').replace(/\s+/g, '_')}_${receiptNo}.pdf`);
    } else if (returnType === 'datauristring') {
        return doc.output('datauristring');
    }
}

// Helper function to convert number to words
function convertNumberToWords(amount) {
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        var value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
        words_string = words_string.split("  ").join(" ");
    }
    return words_string;
}

// Generate Beautiful Hindi Donation Certificate
async function generateHindiDonationCertificate(receiptNo, data) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fill the template data
            document.getElementById('certDonorName').innerText = (data.donorName || 'NA');
            document.getElementById('certPurpose').innerText = data.donationPurpose || 'धर्मार्थ कार्य';
            document.getElementById('certAmount').innerText = parseFloat(data.donationAmount || 0).toLocaleString('en-IN');
            
            const today = new Date();
            const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            document.getElementById('certDate').innerText = formattedToday;
            document.getElementById('certReceiptNo').innerText = receiptNo || 'NA';
            
            // Wait for fonts to load
            await document.fonts.ready;
            
            const certDiv = document.getElementById('certTemplate');
            
            // Wait slightly for images to ensure they are rendered
            await new Promise(r => setTimeout(r, 500));
            
            Swal.fire({
                title: 'Generating Certificate...',
                html: 'Please wait while we render the beautiful Hindi certificate.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            
            html2canvas(certDiv, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#fffdf0',
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                // A4 Landscape: 297 x 210 mm
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });
                
                pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
                pdf.save(`Donation_Certificate_${(data.donorName || 'Donor').replace(/\s+/g, '_')}_${receiptNo}.pdf`);
                
                Swal.close();
                resolve(true);
            }).catch(err => {
                console.error("html2canvas error:", err);
                Swal.fire('Error', 'Failed to generate certificate', 'error');
                reject(err);
            });
            
        } catch (err) {
            console.error("Certificate generation error:", err);
            Swal.fire('Error', 'Failed to prepare certificate', 'error');
            reject(err);
        }
    });
}
