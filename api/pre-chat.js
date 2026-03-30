// ============================================================
//  api/pre-chat.js  — Vercel Serverless Function
//
//  CORS FIX: Uses module.exports (not ES export default),
//  sets CORS headers on EVERY response including errors,
//  and handles the OPTIONS preflight correctly.
//
//  Environment variables (Vercel dashboard → Settings → Env):
//    ALLOWED_ORIGIN = https://your-store.myshopify.com
//    (leave unset to allow all origins during testing)
// ============================================================

module.exports = async function handler(req, res) {

  /* ── CORS headers — must be set on EVERY response ── */
  /*
     If ALLOWED_ORIGIN is not set we fall back to '*' so you
     can test from any origin (browser, Postman, etc.).
     Once confirmed working, set ALLOWED_ORIGIN in Vercel
     to your exact Shopify domain.
  */
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  res.setHeader('Access-Control-Allow-Origin',  allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age',       '86400'); // cache preflight 24h

  /* ── Handle preflight (OPTIONS) request ── */
  /*
     Browsers send OPTIONS before POST when Content-Type is
     application/json. Must return 200/204 with the headers
     above — otherwise the actual POST never fires.
  */
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  /* ── Only allow POST beyond this point ── */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ── Parse body ── */
  /*
     Vercel automatically parses application/json bodies,
     so req.body is already an object. No manual JSON.parse needed.
  */
  const body = req.body || {};
  const name  = (body.name  || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();

  /* ── Validate ── */
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'invalid email address' });
  }

  /* ── Log lead (visible in Vercel → Functions → Logs) ── */
  const timestamp = new Date().toISOString();
  console.log('[pre-chat lead]', JSON.stringify({ name, email, phone, timestamp }));

  /* ── Success ── */
  return res.status(200).json({ ok: true, timestamp });
};
