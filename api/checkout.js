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
      const VALID_ADDONS = new Set(['google_ads', 'appointment_setters_pt', 'appointment_setters_ft']);
      const rawAddons = Array.isArray(req.body.addons) ? req.body.addons : [];
      const addons = rawAddons.filter(a => VALID_ADDONS.has(a));

      if (addons.includes('appointment_setters_pt') && addons.includes('appointment_setters_ft')) {
        return res.status(400).json({ error: 'Cannot select both appointment setter tiers' });
      }

      const lineItems = [
        { price: process.env.STRIPE_PRICE_LEADS_META_ADS, quantity: 1 },
        { price: process.env.STRIPE_PRICE_WEBSITES_MONTHLY, quantity: 1 },
      ];

      const ADDON_PRICE_MAP = {
        google_ads:             process.env.STRIPE_PRICE_LEADS_GOOGLE_ADS,
        appointment_setters_pt: process.env.STRIPE_PRICE_LEADS_APPT_SETTERS_PT,
        appointment_setters_ft: process.env.STRIPE_PRICE_LEADS_APPT_SETTERS_FT,
      };

      for (const addon of addons) {
        const priceId = ADDON_PRICE_MAP[addon];
        if (!priceId) return res.status(500).json({ error: `Missing price ID for addon: ${addon}` });
        lineItems.push({ price: priceId, quantity: 1 });
      }

      sessionParams = {
        mode: 'subscription',
        line_items: lineItems,
        metadata: { service: 'leads', plan: 'ala-carte', addons: addons.join(',') || 'none' },
        success_url: `${origin}/ads/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/ads/checkout`,
      };

    } else if (service === 'websites') {
      sessionParams = {
        mode: 'payment',
        customer_creation: 'always',
        payment_intent_data: { setup_future_usage: 'off_session' },
        line_items: [
          { price: process.env.STRIPE_PRICE_WEBSITES_ONETIME, quantity: 1 },
        ],
        metadata: { service: 'websites', plan: 'websites-crm' },
        success_url: `${origin}/websites/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/websites/checkout`,
      };

    } else if (service === 'sales') {
      sessionParams = {
        mode: 'subscription',
        line_items: [
          { price: process.env.STRIPE_PRICE_SALES_LICENSE, quantity: 1 },
        ],
        metadata: { service: 'sales', plan: 'monthly' },
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
    res.status(500).json({ error: err.message });
  }
};
