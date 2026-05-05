// ============================================================
//  api/pre-chat.js  — Vercel Serverless Function
//
//  CORS: Allows your live store, any Shopify preview URL,
//  and localhost for development. No env variable needed.
// ============================================================

module.exports = async function handler(req, res) {

  /* ── Allowed origins ─────────────────────────────────────
     Add your real store domain here.
     Shopify preview URLs (*.shopifypreview.com) and
     localhost are always allowed automatically below.
  ─────────────────────────────────────────────────────── */
  const ALLOWED_ORIGINS = [
    'https://detaelectrical.com.au',      // your live store (no trailing slash)
    'https://e24965-c4.myshopify.com',    // your myshopify domain
  ];

  /* ── Dynamically resolve correct CORS origin ─────────── */
  const requestOrigin = req.headers.origin || '';

  const isAllowed =
    ALLOWED_ORIGINS.includes(requestOrigin)            ||  // exact match
    /\.shopifypreview\.com$/.test(requestOrigin)       ||  // any preview URL
    /\.myshopify\.com$/.test(requestOrigin)            ||  // any myshopify URL
    /^https?:\/\/localhost(:\d+)?$/.test(requestOrigin);   // local dev

  /* Send back the EXACT requesting origin if allowed,
     otherwise send the first allowed origin as fallback  */
  const corsOrigin = isAllowed ? requestOrigin : ALLOWED_ORIGINS[0];

  /* ── CORS headers — set on EVERY response ─────────────── */
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age',       '86400');
  res.setHeader('Vary', 'Origin'); // important for CDN caching

  /* ── Handle preflight ────────────────────────────────── */
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  /* ── Block disallowed origins ────────────────────────── */
  if (!isAllowed) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  /* ── Only POST beyond this point ─────────────────────── */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* ── Parse body ──────────────────────────────────────── */
  const body  = req.body || {};
  const name  = (body.name  || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const currentpage = (body.currentpage || '').trim();   
  const postcode    = (body.postcode    || '').trim();   
  const product     = (body.product     || '').trim();   
  const serialno    = (body.serialnumber|| '').trim(); 
  const brandName   = (body.brandName   || '').trim();

  /* ── Validate ────────────────────────────────────────── */
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid email address' });
  }

  /* ── Log (Vercel dashboard → Functions → Logs) ───────── */
  const timestamp = new Date().toISOString();
  console.log('[pre-chat lead]', JSON.stringify({ name, email, phone, currentpage, brandName, postcode, product, serialno, timestamp, origin: requestOrigin }));

  /* ── Success ─────────────────────────────────────────── */
  return res.status(200).json({ ok: true, timestamp });
};
