const { google } = require('googleapis');

/**
 * Appends a lead row to a Google Sheet.
 * Requires:
 *   GOOGLE_SHEETS_ID — the spreadsheet ID
 *   GOOGLE_SERVICE_ACCOUNT_KEY — JSON string of service account credentials
 */
async function appendLeadToSheet(lead) {
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!sheetsId || !serviceAccountKey) return;

  try {
    const credentials = JSON.parse(serviceAccountKey);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetsId,
      range: 'Leads!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          lead.id,
          new Date(lead.createdAt).toLocaleString('pt-BR'),
          lead.seller?.name || '',
          lead.seller?.phone || '',
          lead.link?.name || '',
          lead.sourceIp || '',
          lead.referer || '',
        ]],
      },
    });

    console.log('Lead synced to Google Sheets');
  } catch (err) {
    console.error('Google Sheets sync error:', err.message);
  }
}

module.exports = { appendLeadToSheet };
