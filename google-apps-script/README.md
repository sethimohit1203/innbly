# innbly Google Sheets backend — setup

This turns a Google Sheet you own into the storage backend for visit
requests, signups, newsletter subscriptions, and contact messages, and a
best-effort backup + email notification for host property listings (the
primary store for listings is Supabase — see `supabase/host_submissions.sql`
— this Sheet is a secondary copy plus a notification trigger). It also
emails `innblysupport@gmail.com` whenever a visit request, contact message,
or host listing comes in. No paid services required — no n8n, no Cloudinary.

The site never talks to this Sheet directly from the browser — all
submissions go through the site's own `/api/*` serverless functions first
(see `api/` in the project root), which apply rate limiting and keep the
Web App URL out of the public JS bundle entirely.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like **innbly Data**. You don't need to create any tabs —
   the script creates `Leads`, `Signups`, `Newsletter`, `Contact`, and
   `HostListings` tabs
   automatically the first time each type of submission comes in.

## 2. Add the script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code in `Code.gs` and paste in the contents of
   [`Code.gs`](./Code.gs) from this folder.
3. Click **Save** (the disk icon), name the project "innbly backend".

## 3. Set the admin key (for the admin dashboard)

1. In the Apps Script editor, click the gear icon (**Project Settings**) in
   the left sidebar.
2. Scroll to **Script Properties → Add script property**.
3. Add a property named `ADMIN_KEY` with any long random value you choose
   (e.g. generate one at [1password.com/password-generator](https://1password.com/password-generator/)).
   This gates the admin dashboard's read access to your sheet — keep it secret.

## 4. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**. The first time, Google will ask you to authorize the
   script (it needs permission to edit the sheet and send email) — click
   through the "Advanced" warning, this is your own script.
5. Copy the **Web app URL** it gives you (ends in `/exec`).

## 5. Connect the site

Set these as environment variables on your Vercel project (Project →
Settings → Environment Variables) — **not** in `.env` with a `VITE_` prefix,
since anything `VITE_`-prefixed is bundled into the public JS and would leak
the URL and key to every visitor:

| Variable | Value |
|---|---|
| `SHEETS_WEBAPP_URL` | The Web app URL from step 4 |
| `ADMIN_SHEETS_KEY` | The same value you set for `ADMIN_KEY` in step 3 |
| `ADMIN_PASSCODE` | A passcode you'll type to log into `/admin` |
| `ADMIN_SESSION_SECRET` | Another long random value, used to sign the admin login cookie |

For local development, copy `.env.example` to `.env` in the project root
and fill in the same values — the local dev API server (`npm run dev`)
reads them the same way Vercel does.

That's it — visit requests, signups, newsletter signups, and contact
messages submitted on the site will now land as rows in your Sheet,
leads/contact messages will also trigger an email to
`innblysupport@gmail.com`, and `/admin` will show live counts.

## Notes & limitations

- **This is not secure password authentication.** The "login/signup" flow
  on the site only collects a name, email, and role to personalize the
  experience and record who's interested — it does not create real
  password-protected accounts. Treat the Signups tab as a lead list, not a
  user database.
- If you ever need to update the script, edit `Code.gs` in the Apps Script
  editor and create a **new deployment** (or manage deployments → edit) —
  editing the code alone doesn't update an already-deployed Web App URL.
- Free tier limits: Apps Script Web Apps have a generous free quota (20,000
  URL fetch calls/day, 100 emails/day on a personal Gmail account) — far
  more than a small site needs.
