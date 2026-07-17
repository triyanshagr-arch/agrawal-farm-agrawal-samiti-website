// --- DASHBOARD BACKEND UPDATE ---
// Add this code to your Google Apps Script (Code.gs)

// 1. First, find your `function doGet(e)` at the top of Code.gs.
// Inside `doGet(e)`, under `// Public actions (No password required)`, add this IF statement:

/*
  if (action === "get_member_dashboard") {
    return getMemberDashboard(e.parameter.phone);
  }
*/

// 2. Second, paste this entire new function at the very bottom of your Code.gs file:

function getMemberDashboard(phone) {
  if (!phone) return respond({ success: false, error: "Phone number required" });
  
  // Clean phone number (strip +91 and spaces)
  const cleanPhone = String(phone).replace(/^\+91|\D/g, '');
  const result = { success: true, profile: null, donations: [], bookings: [] };
  
  // -- 1. Find Member Profile --
  try {
    const memSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Memberships");
    if (memSheet) {
      const memData = memSheet.getDataRange().getValues();
      for (let i = memData.length - 1; i >= 1; i--) {
        const mPhone = String(memData[i][6]).replace(/^\+91|\D/g, ''); // Col G
        if (mPhone === cleanPhone) {
          result.profile = {
            membershipNo: memData[i][1],
            fullName: memData[i][2] + " " + memData[i][3],
            status: memData[i][22],
            timestamp: memData[i][0]
          };
          break; // Stop when we find their latest profile
        }
      }
    }
  } catch(e) { console.error("Error fetching profile", e); }
  
  // -- 2. Find Donations --
  try {
    const donSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Donations");
    if (donSheet) {
      const donData = donSheet.getDataRange().getValues();
      for (let i = donData.length - 1; i >= 1; i--) {
        let found = false;
        for (let j = 0; j < donData[i].length; j++) {
          if (String(donData[i][j]).replace(/^\+91|\D/g, '') === cleanPhone) {
            found = true; break;
          }
        }
        if (found) {
          result.donations.push({
            receiptNo: donData[i][1],
            donorName: donData[i][2],
            donationAmount: donData[i][5],
            donationPurpose: donData[i][6],
            status: donData[i][11],
            timestamp: donData[i][0]
          });
        }
      }
    }
  } catch(e) { console.error("Error fetching donations", e); }
  
  // -- 3. Find Bookings --
  try {
    const bookSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bookings");
    if (bookSheet) {
      const bookData = bookSheet.getDataRange().getValues();
      for (let i = bookData.length - 1; i >= 1; i--) {
        let found = false;
        for (let j = 0; j < bookData[i].length; j++) {
          if (String(bookData[i][j]).replace(/^\+91|\D/g, '') === cleanPhone) {
            found = true; break;
          }
        }
        if (found) {
          result.bookings.push({
            bookingId: bookData[i][1],
            bookingName: bookData[i][2],
            bookingDate: bookData[i][5],
            eventType: bookData[i][6],
            status: bookData[i][11],
            timestamp: bookData[i][0]
          });
        }
      }
    }
  } catch(e) { console.error("Error fetching bookings", e); }
  
  return respond(result);
}
