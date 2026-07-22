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
  hostListing: 'HostListings',
};

var SHEET_HEADERS = {
  lead: ['Timestamp', 'Name', 'Phone', 'Property', 'Visit Date', 'Slot'],
  signup: ['Timestamp', 'Name', 'Email', 'Role', 'Method'],
  newsletter: ['Timestamp', 'Email'],
  contact: ['Timestamp', 'Name', 'Email', 'Phone', 'Message'],
  hostListing: [
    'Timestamp', 'Owner Name', 'Owner Email', 'Owner Phone',
    'Property Title', 'Property Type', 'Description',
    'City', 'Neighborhood', 'Address',
    'Max Guests', 'Price/Night', 'Security Deposit', 'Amenities',
    'Photo URLs', 'Document URLs',
  ],
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

    if (type === 'lead' || type === 'contact' || type === 'hostListing') {
      sendNotificationEmail(type, data);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.action === 'stats') {
    var expectedKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    if (!expectedKey || params.key !== expectedKey) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }
    return jsonResponse(buildStats());
  }

  return jsonResponse({ ok: true, message: 'innbly Apps Script backend is running.' });
}

function buildStats() {
  var types = ['lead', 'signup', 'newsletter', 'contact', 'hostListing'];
  var counts = {};
  var recent = {};

  types.forEach(function (type) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES[type]);
    if (!sheet || sheet.getLastRow() <= 1) {
      counts[type] = 0;
      recent[type] = [];
      return;
    }

    var numRows = sheet.getLastRow() - 1;
    counts[type] = numRows;

    var startRow = Math.max(2, sheet.getLastRow() - 19);
    var values = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, sheet.getLastColumn()).getValues();
    recent[type] = values.reverse().map(function (row) {
      return row.map(function (cell) {
        return cell instanceof Date ? cell.toISOString() : cell;
      });
    });
  });

  return { counts: counts, recent: recent };
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
  } else if (type === 'hostListing') {
    sheet.appendRow([
      now, data.ownerName, data.ownerEmail, data.ownerPhone,
      data.propertyTitle, data.propertyType, data.description,
      data.city, data.neighborhood, data.address,
      data.maxGuests, data.pricePerNight, data.securityDeposit,
      (data.amenities || []).join(', '),
      (data.photoUrls || []).join(', '),
      (data.documentUrls || []).join(', '),
    ]);
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
  } else if (type === 'hostListing') {
    subject = 'New host listing submitted — ' + data.propertyTitle;
    body =
      'Owner: ' + data.ownerName + ' (' + data.ownerEmail + ', ' + data.ownerPhone + ')\n' +
      'Property: ' + data.propertyTitle + ' — ' + data.propertyType + '\n' +
      'Location: ' + data.neighborhood + ', ' + data.city + '\n' +
      'Price: Rs ' + data.pricePerNight + '/night, deposit Rs ' + data.securityDeposit + '\n' +
      'Max guests: ' + data.maxGuests + '\n' +
      'Photos: ' + ((data.photoUrls || []).length) + ', Documents: ' + ((data.documentUrls || []).length) + '\n\n' +
      'Full record is in the HostListings sheet tab.';
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
