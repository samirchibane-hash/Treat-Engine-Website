const jwt = require('jsonwebtoken');
const { crm } = require('../../lib/crm');

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

  const { service, status } = req.query;

  // Reads the CRM's clients table and returns it in the shape /admin was built
  // around (the retired onboarding database's customers + onboarding join).
  let query = crm()
    .from('clients')
    .select(`
      id, session_id, stripe_customer_id, stripe_subscription_id,
      service, plan, email, full_name, phone, business_name,
      amount_paid, currency, status, submitted_at,
      onboarding_data, onboarded_at
    `)
    .order('submitted_at', { ascending: false });

  if (service) query = query.eq('service', service);
  if (status)  query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('Customers fetch error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  const customers = (data || []).map((c) => ({
    id: c.id,
    stripe_session_id: c.session_id,
    stripe_customer_id: c.stripe_customer_id,
    stripe_subscription_id: c.stripe_subscription_id,
    service: c.service,
    plan: c.plan,
    email: c.email,
    name: c.full_name,
    phone: c.phone,
    business_name: c.business_name,
    amount_paid: c.amount_paid,
    currency: c.currency,
    status: c.status,
    created_at: c.submitted_at,
    onboarding: c.onboarding_data
      ? [{ data: c.onboarding_data, submitted_at: c.onboarded_at }]
      : [],
  }));

  res.json({ customers });
};
