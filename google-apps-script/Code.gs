/**
 * innbly backend — Google Apps Script Web App
 *
 * Receives form submissions from the innbly site (visit requests, signups,
 * newsletter subscriptions, contact messages) and appends them as rows to
 * a Google Sheet, one tab per submission type. Also emails the support
 * inbox for leads and contact messages.
 *
 * Setup: see google-apps-script/README.md in this folder.
 */

var SUPPORT_EMAIL = 'innblysupport@gmail.com';

var SHEET_NAMES = {
  lead: 'Leads',
  signup: 'Signups',
  newsletter: 'Newsletter',
  contact: 'Contact',
};

var SHEET_HEADERS = {
  lead: ['Timestamp', 'Name', 'Phone', 'Property', 'Visit Date', 'Slot'],
  signup: ['Timestamp', 'Name', 'Email', 'Role', 'Method'],
  newsletter: ['Timestamp', 'Email'],
  contact: ['Timestamp', 'Name', 'Email', 'Phone', 'Message'],
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type;

    if (!SHEET_NAMES[type]) {
      return jsonResponse({ ok: false, error: 'Unknown submission type: ' + type });
    }

    var sheet = getOrCreateSheet(type);
    appendRow(sheet, type, data);

    if (type === 'lead' || type === 'contact') {
      sendNotificationEmail(type, data);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: 'innbly Apps Script backend is running.' });
}

function getOrCreateSheet(type) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = SHEET_NAMES[type];
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(SHEET_HEADERS[type]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRow(sheet, type, data) {
  var now = new Date();
  if (type === 'lead') {
    sheet.appendRow([now, data.name, data.phone, data.propertyTitle, data.visitDate, data.slot || '']);
  } else if (type === 'signup') {
    sheet.appendRow([now, data.name, data.email, data.role, data.method || 'email']);
  } else if (type === 'newsletter') {
    sheet.appendRow([now, data.email]);
  } else if (type === 'contact') {
    sheet.appendRow([now, data.name, data.email, data.phone || '', data.message]);
  }
}

function sendNotificationEmail(type, data) {
  var subject, body;
  if (type === 'lead') {
    subject = 'New visit request — ' + data.propertyTitle;
    body =
      'Name: ' + data.name + '\n' +
      'Phone: ' + data.phone + '\n' +
      'Property: ' + data.propertyTitle + '\n' +
      'Visit date: ' + data.visitDate + '\n' +
      'Slot: ' + (data.slot || 'N/A');
  } else {
    subject = 'New contact message from ' + data.name;
    body =
      'Name: ' + data.name + '\n' +
      'Email: ' + data.email + '\n' +
      'Phone: ' + (data.phone || 'N/A') + '\n\n' +
      data.message;
  }
  MailApp.sendEmail(SUPPORT_EMAIL, subject, body);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
