// ============================================================
//  api/pre-chat.js  — Vercel Serverless Function
//  Receives pre-chat form data and stores/forwards it.
//
//  DEPLOY IN 3 STEPS:
//  1. npm i -g vercel
//  2. vercel login
//  3. vercel --prod   (run from this project folder)
//
//  Set these environment variables in the Vercel dashboard:
//    ALLOWED_ORIGIN   = https://your-shopify-store.myshopify.com
//    NOTIFY_EMAIL     = you@yourcompany.com   (optional — see below)
//    SENDGRID_API_KEY = SG.xxxxx              (optional — for email alerts)
// ============================================================

export default async function handler(req, res) {

  /* ── CORS ── */
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ── Parse body ── */
  const { name, email, phone } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  /* ── Basic email format check ── */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  /* ── Timestamp + log to Vercel function logs ── */
  const timestamp = new Date().toISOString();
  const lead = { name, email, phone: phone || '', timestamp };
  console.log('[pre-chat lead]', JSON.stringify(lead));

  /* ────────────────────────────────────────────────────────
     OPTIONAL: Send email notification via SendGrid
     Uncomment the block below if you want an email
     every time someone fills the form.
  ──────────────────────────────────────────────────────── */
  /*
  if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: process.env.NOTIFY_EMAIL }] }],
          from:    { email: 'noreply@yourstore.com', name: 'Chat Widget' },
          subject: `New chat lead: ${name}`,
          content: [{
            type: 'text/plain',
            value: `Name:  ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nTime:  ${timestamp}`
          }]
        })
      });
    } catch (emailErr) {
      console.error('[pre-chat] SendGrid error:', emailErr.message);
      // Don't fail the whole request if email fails
    }
  }
  */

  /* ────────────────────────────────────────────────────────
     OPTIONAL: Save to a Google Sheet via Google Sheets API
     or any other CRM / database of your choice.
     Drop a comment below and I can add that integration.
  ──────────────────────────────────────────────────────── */

  /* ── Respond with success ── */
  return res.status(200).json({ ok: true, timestamp });
}
