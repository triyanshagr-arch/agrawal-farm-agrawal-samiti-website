import re

# 1. Update pdf_generator.js
with open('pdf_generator.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_generateReceiptPDF = """// Generate Receipt PDF
async function generateReceiptPDF(membershipNo, data, returnType = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Draw beautiful double border
    doc.setDrawColor(211, 47, 47); // Red
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);
    doc.setDrawColor(255, 215, 0); // Gold
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 186, 273);

    // Try loading Header Images
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        doc.addImage(agrasenImg, 'PNG', 15, 15, 30, 40); // Top left
        const lakshmiImg = await loadImage('images/lakshmi.png');
        doc.addImage(lakshmiImg, 'PNG', 165, 15, 30, 40); // Top right
        
        // Watermark
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.15}));
            doc.addImage(agrasenImg, 'PNG', 55, 80, 100, 130);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }
    } catch(e) { console.error("Images failed to load", e); }

    // Setup basic styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(211, 47, 47); // Primary Red
    doc.text("AGRAWAL SAMAJ SAMITI", 105, 25, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Agrawal Farm, Mansarovar, Jaipur (Reg.)", 105, 33, null, null, "center");
    
    doc.setFontSize(10);
    doc.text("Email: assagarwalfarmjpr@gmail.com | Phone: +91 9829220486", 105, 40, null, null, "center");
    doc.setTextColor(211, 47, 47);
    doc.text("पंजीयन संख्या: 169/93-94", 105, 46, null, null, "center");

    doc.setDrawColor(211, 47, 47);
    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("MEMBERSHIP RECEIPT", 105, 60, null, null, "center");

    // Meta details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 75;
    
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    doc.text(`Receipt Date: ${formattedToday}`, 20, y);
    doc.text(`Membership No: ${membershipNo}`, 120, y);
    y += 15;

    // Member Details
    doc.setFillColor(255, 243, 243);
    doc.rect(15, y-5, 180, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(211, 47, 47);
    doc.text("Member Details", 20, y);
    y += 12;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Name: ${data.title || ''} ${data.fullName || 'NA'}`, 20, y);
    y += 10;
    doc.text(`Mobile: ${data.mobileNumber || 'NA'}`, 20, y);
    doc.text(`Email: ${data.emailId || 'NA'}`, 120, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Membership Type: Lifetime Membership (Rs. 501/-)`, 20, y);
    doc.setFont("helvetica", "normal");
    
    y += 15;

    // Transaction Details
    doc.setFillColor(255, 243, 243);
    doc.rect(15, y-5, 180, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(211, 47, 47);
    doc.text("Transaction Details", 20, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Transaction ID / Ref: ${data.transactionId || 'NA'}`, 20, y);
    y += 10;
    doc.text(`UTR No: ${data.utrNo || "NA"}`, 20, y);
    y += 10;
    doc.text(`Bank Account Name: ${data.bankAccountName || 'NA'}`, 20, y);

    y += 15;

    // Family Details
    if (data.familyMembers && data.familyMembers.length > 0) {
        doc.setFillColor(255, 243, 243);
        doc.rect(15, y-5, 180, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(211, 47, 47);
        doc.text(`Family Members (${data.familyMembers.length})`, 20, y);
        y += 12;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        data.familyMembers.forEach((m, idx) => {
            doc.text(`${idx + 1}. ${m.name} (${m.relationship}) - DOB: ${m.dob} - Edu: ${m.education}`, 20, y);
            y += 8;
        });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 280, null, null, "center");

    if (returnType === 'save') {
        doc.save(`Receipt_${(data.fullName || 'User').replace(/\s+/g, '_')}_${membershipNo}.pdf`);
    } else if (returnType === 'datauristring') {
        return doc.output('datauristring');
    }
}"""

# Use regex to replace the old generateReceiptPDF function
new_content = re.sub(
    r'// Generate Receipt PDF\nfunction generateReceiptPDF.*?^}',
    new_generateReceiptPDF,
    content,
    flags=re.MULTILINE | re.DOTALL
)

with open('pdf_generator.js', 'w', encoding='utf-8') as f:
    f.write(new_content)


# 2. Update submit_handler.js
with open('submit_handler.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace("generateReceiptPDF(membershipNo, dataObj, 'save');", "await generateReceiptPDF(membershipNo, dataObj, 'save');")

with open('submit_handler.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated pdf_generator.js and submit_handler.js!")
