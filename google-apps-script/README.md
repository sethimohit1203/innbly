# innbly Google Sheets backend — setup

This turns a Google Sheet you own into the storage backend for visit
requests, signups, newsletter subscriptions, and contact messages. It also
emails `innblysupport@gmail.com` whenever a visit request or contact message
comes in. No paid services required.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like **innbly Data**. You don't need to create any tabs —
   the script creates `Leads`, `Signups`, `Newsletter`, and `Contact` tabs
   automatically the first time each type of submission comes in.

## 2. Add the script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code in `Code.gs` and paste in the contents of
   [`Code.gs`](./Code.gs) from this folder.
3. Click **Save** (the disk icon), name the project "innbly backend".

## 3. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**. The first time, Google will ask you to authorize the
   script (it needs permission to edit the sheet and send email) — click
   through the "Advanced" warning, this is your own script.
5. Copy the **Web app URL** it gives you (ends in `/exec`).

## 4. Connect the site

1. In the `innbly` project folder, copy `.env.example` to `.env`.
2. Paste your Web app URL as the value of `VITE_SHEETS_WEBAPP_URL`.
3. Restart the dev server (`npm run dev`) or rebuild (`npm run build`) so
   Vite picks up the new environment variable.

That's it — visit requests, signups, newsletter signups, and contact
messages submitted on the site will now land as rows in your Sheet, and
leads/contact messages will also trigger an email to
`innblysupport@gmail.com`.

## Notes & limitations

- **This is not secure password authentication.** The "login/signup" flow
  on the site only collects a name, email, and role to personalize the
  experience and record who's interested — it does not create real
  password-protected accounts. Treat the Signups tab as a lead list, not a
  user database.
- If you ever need to update the script, edit `Code.gs` in the Apps Script
  editor and create a **new deployment** (or manage deployments → edit) —
  editing the code alone doesn't update a already-deployed Web App URL.
- Free tier limits: Apps Script Web Apps have a generous free quota (20,000
  URL fetch calls/day, 100 emails/day on a personal Gmail account) — far
  more than a small site needs.
