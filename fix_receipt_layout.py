import re

with open('pdf_generator.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Resize images from 30x40 to 26x35 to avoid touching the horizontal line
content = content.replace("doc.addImage(agrasenImg, 'PNG', 15, 15, 30, 40);", "doc.addImage(agrasenImg, 'PNG', 15, 15, 26, 35);")
content = content.replace("doc.addImage(lakshmiImg, 'PNG', 165, 15, 30, 40);", "doc.addImage(lakshmiImg, 'PNG', 169, 15, 26, 35);")

# 2. Push down the horizontal line and title in both receipts
content = content.replace("doc.line(15, 50, 195, 50);", "doc.line(15, 58, 195, 58);")
content = content.replace("doc.text(\"MEMBERSHIP RECEIPT\", 105, 60, null, null, \"center\");", "doc.text(\"MEMBERSHIP RECEIPT\", 105, 68, null, null, \"center\");")
content = content.replace("let y = 75;", "let y = 82;")

content = content.replace("doc.line(15, 48, 195, 48);", "doc.line(15, 58, 195, 58);")
content = content.replace("doc.text(\"DONATION RECEIPT\", 105, 58, null, null, \"center\");", "doc.text(\"DONATION RECEIPT\", 105, 68, null, null, \"center\");")

# 3. Move the watermark to the end, just before the footer, so it's not hidden by the pink boxes
# For generateReceiptPDF
watermark_block1 = """        // Watermark
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.15}));
            doc.addImage(agrasenImg, 'PNG', 55, 80, 100, 130);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }"""
content = content.replace(watermark_block1, "")

# We need to insert the watermark at the end of generateReceiptPDF.
footer_start1 = """    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 280, null, null, "center");"""

watermark_replacement1 = """    // Watermark
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.1}));
            doc.addImage(agrasenImg, 'PNG', 55, 100, 100, 130);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }
    } catch(e) {}

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 280, null, null, "center");"""
content = content.replace(footer_start1, watermark_replacement1)

# For generateDonationReceiptPDF
watermark_block2 = """        // Watermark
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.3}));
            doc.addImage(agrasenImg, 'PNG', 55, 80, 100, 130);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }"""
content = content.replace(watermark_block2, "")

footer_start2 = """    // Bottom Notice
    doc.setFontSize(10);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 275, null, null, "center");"""

watermark_replacement2 = """    // Watermark
    try {
        const agrasenImg = await loadImage('images/agrasen_full.png');
        if(doc.GState) {
            doc.setGState(new doc.GState({opacity: 0.1}));
            doc.addImage(agrasenImg, 'PNG', 55, 100, 100, 130);
            doc.setGState(new doc.GState({opacity: 1.0}));
        }
    } catch(e) {}

    // Bottom Notice
    doc.setFontSize(10);
    doc.text("This is a computer-generated receipt and does not require a physical signature.", 105, 275, null, null, "center");"""
content = content.replace(footer_start2, watermark_replacement2)

with open('pdf_generator.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed layout bugs in pdf_generator.js!")
