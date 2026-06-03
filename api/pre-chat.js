// ============================================================
//  api/pre-chat.js  — Vercel Serverless Function
// ============================================================

module.exports = async function handler(req, res) {

const ALLOWED_ORIGINS = [
  'https://detaelectrical.com.au',
  'https://e24965-c4.myshopify.com',
  'https://www.arlec.com.au',         
  'https://arlec-au.myshopify.com'    
];

  const requestOrigin = req.headers.origin || '';

  const isAllowed =
    ALLOWED_ORIGINS.includes(requestOrigin)          ||
    /\.shopifypreview\.com$/.test(requestOrigin)     ||
    /\.myshopify\.com$/.test(requestOrigin)          ||
    /^https?:\/\/localhost(:\d+)?$/.test(requestOrigin);

  const corsOrigin = isAllowed ? requestOrigin : ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age',       '86400');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAllowed)               return res.status(403).json({ error: 'Origin not allowed' });
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  /* ── Parse body ──────────────────────────────────────── */
  const body      = req.body || {};
  const name      = (body.name         || '').trim();
  const email     = (body.email        || '').trim();
  const phone     = (body.phone        || '').trim();
  const currentpage = (body.currentpage  || '').trim();
  const postcode  = (body.postcode     || '').trim();
  const product   = (body.product      || '').trim();
  const store     = (body.store        || '').trim();
  const serialno  = (body.serialnumber || '').trim();
  const brandName = (body.brandName    || '').trim();
  // ── Accept timestamp from client, fall back to server time ──
  const timestamp = (body.timestamp    || '').trim() || new Date().toISOString();

  /* ── Validate ────────────────────────────────────────── */
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid email address' });
  }

  /* ── Log ─────────────────────────────────────────────── */
  console.log('[pre-chat lead]', JSON.stringify({
    name,
    email,
    phone        : phone     || null,
    currentpage  : currentpage || null,
    brandName    : brandName || null,
    postcode     : postcode  || null,
    product      : product   || null,
    store        : store     || null,
    serialno     : serialno  || null,
    timestamp,                          // ← now logged too
    origin       : requestOrigin
  }));

  /* ── Success ─────────────────────────────────────────── */
  return res.status(200).json({ ok: true, timestamp });
};
