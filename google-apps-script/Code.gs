/**
 * innbly backend — Google Apps Script Web App
 *
 * Receives form submissions from the innbly site (visit requests, signups,
 * newsletter subscriptions, contact messages) and appends them as rows to
 * a Google Sheet, one tab per submission type. Also emails the support
 * inbox for leads and contact messages, and — for a new host listing —
 * a separate branded confirmation email to the host who submitted it.
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
  booking: 'Bookings',
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
  booking: [
    'Timestamp', 'Property', 'Host Name', 'Host Email', 'Host Phone',
    'Tenant Name', 'Tenant Email', 'Tenant Phone',
    'Check-in', 'Check-out', 'Nights', 'Guests',
    'Guest Total', 'Host Payout',
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
    } else if (type === 'booking') {
      sendBookingEmails(data);
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
  var types = ['lead', 'signup', 'newsletter', 'contact', 'hostListing', 'booking'];
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
  } else if (type === 'booking') {
    sheet.appendRow([
      now, data.propertyTitle, data.hostName || '', data.hostEmail || '', data.hostPhone || '',
      data.tenantName, data.tenantEmail, data.tenantPhone,
      data.checkIn, data.checkOut, data.nights, data.guests,
      data.guestTotal, data.hostPayoutAmount,
    ]);
  }
}

function sendNotificationEmail(type, data) {
  var subject, rows, plainBody;
  if (type === 'lead') {
    subject = 'New visit request — ' + data.propertyTitle;
    rows = [
      ['Name', data.name],
      ['Phone', data.phone],
      ['Property', data.propertyTitle],
      ['Visit date', data.visitDate],
      ['Slot', data.slot || 'N/A'],
    ];
    plainBody =
      'Name: ' + data.name + '\nPhone: ' + data.phone + '\nProperty: ' + data.propertyTitle +
      '\nVisit date: ' + data.visitDate + '\nSlot: ' + (data.slot || 'N/A');
  } else if (type === 'hostListing') {
    subject = 'New host listing submitted — ' + data.propertyTitle;
    rows = [
      ['Owner', data.ownerName + ' (' + data.ownerEmail + ', ' + data.ownerPhone + ')'],
      ['Property', data.propertyTitle + ' — ' + data.propertyType],
      ['Location', data.neighborhood + ', ' + data.city],
      ['Price', 'Rs ' + data.pricePerNight + '/night, deposit Rs ' + data.securityDeposit],
      ['Max guests', data.maxGuests],
      ['Photos / Documents', ((data.photoUrls || []).length) + ' photos, ' + ((data.documentUrls || []).length) + ' documents'],
    ];
    plainBody =
      'Owner: ' + data.ownerName + ' (' + data.ownerEmail + ', ' + data.ownerPhone + ')\n' +
      'Property: ' + data.propertyTitle + ' — ' + data.propertyType + '\n' +
      'Location: ' + data.neighborhood + ', ' + data.city + '\n' +
      'Price: Rs ' + data.pricePerNight + '/night, deposit Rs ' + data.securityDeposit + '\n' +
      'Max guests: ' + data.maxGuests + '\n' +
      'Photos: ' + ((data.photoUrls || []).length) + ', Documents: ' + ((data.documentUrls || []).length) + '\n\n' +
      'Full record is in the HostListings sheet tab.';
  } else {
    subject = 'New contact message from ' + data.name;
    rows = [
      ['Name', data.name],
      ['Email', data.email],
      ['Phone', data.phone || 'N/A'],
      ['Message', data.message],
    ];
    plainBody = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + (data.phone || 'N/A') + '\n\n' + data.message;
  }

  MailApp.sendEmail({
    to: SUPPORT_EMAIL,
    subject: subject,
    body: plainBody,
    htmlBody: emailTemplate(subject, rows, null),
  });

  if (type === 'hostListing' && data.ownerEmail) {
    sendHostConfirmationEmail(data);
  }
}

/** Confirmation email to the host who submitted a listing — separate from the
 * admin notification above, since the host needs different information
 * (a plain confirmation + what happens next, not the raw submission data). */
function sendHostConfirmationEmail(data) {
  var subject = 'We received your listing — ' + data.propertyTitle;
  var rows = [
    ['Property', data.propertyTitle + ' — ' + data.propertyType],
    ['Location', data.neighborhood + ', ' + data.city],
    ['Price', 'Rs ' + data.pricePerNight + '/night'],
    ['Status', 'Pending review'],
  ];
  var footer =
    '<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">' +
    'Thanks for listing with innbly, ' + escapeHtml(data.ownerName) + '! Our team reviews every submission before ' +
    'it goes live. You\'ll hear from us once it\'s approved — usually within 24–48 hours.' +
    '</p>';
  var plainBody =
    'Thanks for listing with innbly, ' + data.ownerName + '!\n\n' +
    'Property: ' + data.propertyTitle + ' — ' + data.propertyType + '\n' +
    'Location: ' + data.neighborhood + ', ' + data.city + '\n' +
    'Price: Rs ' + data.pricePerNight + '/night\n' +
    'Status: Pending review\n\n' +
    'Our team reviews every submission before it goes live — usually within 24-48 hours.';

  MailApp.sendEmail({
    to: data.ownerEmail,
    subject: subject,
    body: plainBody,
    htmlBody: emailTemplate(subject, rows, footer),
  });
}

/** A confirmed, paid booking notifies three parties, each with what they
 * actually need: admin gets the full record, the host gets a heads-up with
 * guest contact + their payout amount (paid out manually until Razorpay
 * Route is set up — see CLAUDE.md), and the tenant gets a receipt. */
function sendBookingEmails(data) {
  var subject = 'Booking confirmed — ' + data.propertyTitle;
  var adminRows = [
    ['Property', data.propertyTitle],
    ['Host', (data.hostName || 'Unknown') + (data.hostEmail ? ' (' + data.hostEmail + ', ' + data.hostPhone + ')' : '')],
    ['Tenant', data.tenantName + ' (' + data.tenantEmail + ', ' + data.tenantPhone + ')'],
    ['Dates', data.checkIn + ' → ' + data.checkOut + ' (' + data.nights + ' nights, ' + data.guests + ' guests)'],
    ['Guest paid', 'Rs ' + data.guestTotal],
    ['Host payout owed', 'Rs ' + data.hostPayoutAmount + ' (pay manually, mark paid in /admin/bookings)'],
  ];
  MailApp.sendEmail({
    to: SUPPORT_EMAIL,
    subject: subject,
    body: adminRows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'),
    htmlBody: emailTemplate(subject, adminRows, null),
  });

  if (data.hostEmail) {
    var hostSubject = 'New booking for ' + data.propertyTitle;
    var hostRows = [
      ['Guest', data.tenantName],
      ['Guest phone', data.tenantPhone],
      ['Check-in', data.checkIn],
      ['Check-out', data.checkOut],
      ['Guests', data.guests],
      ['Your payout', 'Rs ' + data.hostPayoutAmount],
    ];
    var hostFooter =
      '<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">' +
      'Great news — your property ' + escapeHtml(data.propertyTitle) + ' has a confirmed, paid booking. ' +
      'The guest\'s contact details are above so you can coordinate check-in. Your payout is currently ' +
      'transferred manually by the innbly team.' +
      '</p>';
    MailApp.sendEmail({
      to: data.hostEmail,
      subject: hostSubject,
      body: hostRows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'),
      htmlBody: emailTemplate(hostSubject, hostRows, hostFooter),
    });
  }

  var tenantSubject = 'Your innbly booking is confirmed';
  var tenantRows = [
    ['Property', data.propertyTitle],
    ['Check-in', data.checkIn],
    ['Check-out', data.checkOut],
    ['Guests', data.guests],
    ['Total paid', 'Rs ' + data.guestTotal],
  ];
  var tenantFooter =
    '<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">' +
    'Thanks for booking with innbly, ' + escapeHtml(data.tenantName) + '! Your host now has your contact details ' +
    'to coordinate check-in.' +
    '</p>';
  MailApp.sendEmail({
    to: data.tenantEmail,
    subject: tenantSubject,
    body: tenantRows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'),
    htmlBody: emailTemplate(tenantSubject, tenantRows, tenantFooter),
  });
}

/** Shared branded HTML email wrapper — a simple card matching the site's
 * red/green palette, readable in Gmail's clipped-width preview and on
 * mobile. `footerHtml`, if given, renders below the detail rows (used for
 * the host confirmation's plain-language "what happens next" note). */
function emailTemplate(title, rows, footerHtml) {
  var rowsHtml = rows.map(function (r) {
    return (
      '<tr>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;font-weight:600;width:140px;vertical-align:top;">' + escapeHtml(String(r[0])) + '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;vertical-align:top;">' + escapeHtml(String(r[1])) + '</td>' +
      '</tr>'
    );
  }).join('');

  return (
    '<div style="background:#f8fafc;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">' +
        '<div style="background:#d9332a;padding:20px 28px;">' +
          '<span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.02em;">innbly</span>' +
        '</div>' +
        '<div style="padding:28px;">' +
          '<h1 style="margin:0 0 20px;color:#0f172a;font-size:18px;font-weight:800;">' + escapeHtml(title) + '</h1>' +
          (footerHtml || '') +
          '<table style="width:100%;border-collapse:collapse;">' + rowsHtml + '</table>' +
        '</div>' +
        '<div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;">' +
          '<span style="color:#94a3b8;font-size:12px;">innbly — India\'s premium stay & rental network</span>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
