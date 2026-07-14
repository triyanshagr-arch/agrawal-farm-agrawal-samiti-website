with open('code_gs_extracted_full.txt', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """  // Delete Notice
  if (action === "delete_notice") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notice"); // Change to "Notices" if your sheet is named that
    if (!sheet) return respond({ success: false, error: "Notice sheet not found" });
    sheet.deleteRow(e.parameter.row);
    return respond({ success: true });
  }

  if (action === "delete_event") {"""

# Using a standard search
if '  if (action === "delete_event") {' in content:
    content = content.replace('  if (action === "delete_event") {', replacement)
elif 'if (action === "delete_event") {' in content:
    content = content.replace('if (action === "delete_event") {', replacement)

with open('code_gs_final.txt', 'w', encoding='utf-8') as out:
    out.write(content)

print('Updated code_gs_final.txt')
