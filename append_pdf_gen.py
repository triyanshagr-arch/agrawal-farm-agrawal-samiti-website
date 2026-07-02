import os

matrimonial_pdf_code = """

// Generate Matrimonial PDF
window.generateMatrimonialPDF = async function(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    
    // Fill background
    doc.setFillColor(255, 253, 248); // bg-main
    doc.rect(0, 0, pageWidth, 297, 'F');
    
    // Top border
    doc.setFillColor(211, 47, 47); // primary red
    doc.rect(0, 0, pageWidth, 10, 'F');
    doc.setFillColor(245, 124, 0); // secondary orange
    doc.rect(0, 10, pageWidth, 2, 'F');

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(211, 47, 47);
    doc.text("MATRIMONIAL BIODATA", pageWidth/2, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(85, 85, 85);
    doc.text("Agrawal Samaj Samiti, Agrawal Farm, Jaipur", pageWidth/2, 43, { align: 'center' });
    
    // Photo (if available)
    let yPos = 60;
    if (data.photo) {
        try {
            doc.addImage(data.photo, 'JPEG', pageWidth - 60, yPos, 40, 50);
        } catch (e) {
            console.error("Error adding photo to PDF", e);
        }
    }
    
    // Personal Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47);
    doc.text("Personal Details", 20, yPos);
    doc.setLineWidth(0.5);
    doc.setDrawColor(211, 47, 47);
    doc.line(20, yPos + 2, 120, yPos + 2);
    
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    const personalFields = [
        ["Name", data.name],
        ["Gender", data.gender],
        ["Date of Birth", data.dob],
        ["Height", data.height],
        ["Gotra", data.gotra],
        ["Manglik", data.manglik]
    ];
    
    personalFields.forEach(field => {
        doc.setFont("helvetica", "bold");
        doc.text(field[0] + ":", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(field[1] || "N/A", 60, yPos);
        yPos += 7;
    });
    
    // Education & Profession
    yPos = Math.max(yPos + 5, 125);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47);
    doc.text("Education & Profession", 20, yPos);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    const eduFields = [
        ["Education", data.education],
        ["Profession", data.profession],
        ["Income", data.income]
    ];
    
    eduFields.forEach(field => {
        doc.setFont("helvetica", "bold");
        doc.text(field[0] + ":", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(field[1] || "N/A", 60, yPos);
        yPos += 7;
    });
    
    // Family Details
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47);
    doc.text("Family & Contact Details", 20, yPos);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    const familyFields = [
        ["Father's Name", data.father],
        ["Mother's Name", data.mother],
        ["Mobile", data.mobile],
    ];
    
    familyFields.forEach(field => {
        doc.setFont("helvetica", "bold");
        doc.text(field[0] + ":", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(field[1] || "N/A", 60, yPos);
        yPos += 7;
    });
    
    doc.setFont("helvetica", "bold");
    doc.text("Address:", 20, yPos);
    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(data.address || "N/A", 120);
    doc.text(splitAddress, 60, yPos);
    
    // Save PDF
    const filename = `Biodata_${data.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    
    return doc.output('blob');
};
"""

with open("pdf_generator.js", "a", encoding="utf-8") as f:
    f.write(matrimonial_pdf_code)
print("Appended successfully.")
