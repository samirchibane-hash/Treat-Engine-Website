const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    verifyToken(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { service, status } = req.query;

  let query = supabase
    .from('customers')
    .select(`
      id, stripe_session_id, stripe_customer_id, stripe_subscription_id,
      service, plan, email, name, phone, business_name,
      amount_paid, currency, status, created_at,
      onboarding ( data, submitted_at )
    `)
    .order('created_at', { ascending: false });

  if (service) query = query.eq('service', service);
  if (status)  query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Customers fetch error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ customers: data });
};
