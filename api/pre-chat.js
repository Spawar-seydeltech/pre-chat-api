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

  /* ── Respond with success ── */
  return res.status(200).json({ ok: true, timestamp });
}
