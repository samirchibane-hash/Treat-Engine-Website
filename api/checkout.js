const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.SITE_URL || `https://${req.headers.host}`;

  const { service, plan } = req.body || {};

  try {
    let sessionParams;

    if (service === 'leads') {
      sessionParams = {
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_LEADS_MONTHLY, quantity: 1 }],
        metadata: { service: 'leads', plan: 'monthly' },
        success_url: `${origin}/ads/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/ads`,
      };

    } else if (service === 'websites') {
      sessionParams = {
        mode: 'subscription',
        line_items: [
          { price: process.env.STRIPE_PRICE_WEBSITES_ONETIME,  quantity: 1 },
          { price: process.env.STRIPE_PRICE_WEBSITES_MONTHLY,  quantity: 1 },
        ],
        metadata: { service: 'websites', plan: 'websites-crm' },
        success_url: `${origin}/websites/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/websites/checkout`,
      };

    } else if (service === 'sales') {
      sessionParams = {
        mode: 'subscription',
        line_items: [
          { price: process.env.STRIPE_PRICE_SALES_SETUP,   quantity: 1 },
          { price: process.env.STRIPE_PRICE_SALES_MONTHLY, quantity: 1 },
        ],
        metadata: { service: 'sales', plan: 'crm' },
        success_url: `${origin}/sales/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/sales/checkout`,
      };

    } else {
      return res.status(400).json({ error: 'Invalid service' });
    }

    sessionParams.billing_address_collection = 'required';
    sessionParams.phone_number_collection = { enabled: true };

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });

  } catch (err) {
    console.error('Checkout error:', err.message);
    console.error('Price IDs in use:', {
      websites_onetime: process.env.STRIPE_PRICE_WEBSITES_ONETIME,
      websites_monthly: process.env.STRIPE_PRICE_WEBSITES_MONTHLY,
    });
    res.status(500).json({ error: err.message });
  }
};
