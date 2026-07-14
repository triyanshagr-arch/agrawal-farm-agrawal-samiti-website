with open('code_gs_final.txt', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """  // Delete Notice
  if (action === "delete_notice") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notice"); // Change to "Notices" if your sheet is named that
    if (!sheet) return respond({ success: false, error: "Notice sheet not found" });
    sheet.deleteRow(e.parameter.row);
    return respond({ success: true });
  }"""

new_block = """  // Delete Notice
  if (action === "delete_notice") {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notice");
    if (!sheet) sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notices");
    if (!sheet) return respond({ success: false, error: "Notice sheet not found" });
    sheet.deleteRow(e.parameter.row);
    return respond({ success: true });
  }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('code_gs_final.txt', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Patched successfully!')
else:
    print('Block not found!')
