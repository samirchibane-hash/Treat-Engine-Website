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

      // Promo code — looked up live in Stripe, so the discount, its expiry and
      // any redemption limits are all managed from the Stripe Dashboard rather
      // than from this file. TRUEH20 (50% off, duration 'once') halves the first
      // invoice only; renewals bill full price. The page shows a preview of the
      // math, but this lookup is the source of truth.
      //
      // Codes are global to the Stripe account, but this is the only branch that
      // reads `promo` into a Stripe discount and no session here sets
      // allow_promotion_codes — so a leads code cannot be redeemed on the sales
      // or websites checkouts.
      const promo = String(req.body.promo || '').trim().toUpperCase();
      let promotionCodeId = null;

      if (promo) {
        const matches = await stripe.promotionCodes.list({ code: promo, active: true, limit: 1 });
        const match = matches.data[0];
        if (!match || !match.coupon || !match.coupon.valid) {
          return res.status(400).json({ error: 'That promo code isn\u2019t valid.' });
        }
        promotionCodeId = match.id;
      }

      sessionParams = {
        mode: 'subscription',
        line_items: lineItems,
        metadata: {
          service: 'leads',
          plan: 'ala-carte',
          addons: addons.join(',') || 'none',
          promo: promo || 'none',
        },
        success_url: `${origin}/ads/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/ads/checkout`,
      };

      if (promotionCodeId) {
        sessionParams.discounts = [{ promotion_code: promotionCodeId }];
      }

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

    } else if (service === 'sales' && (plan === 'starter' || plan === 'pro')) {
      // ── /sales/checkout-v2 ──
      // Two ClearDeals tiers, each billable monthly or annually, no setup fee.
      // The server picks the price ID — the page only sends tier and interval.
      // Requests without an explicit tier fall through to the legacy branch
      // below, which still serves the original /sales/checkout page.
      const SALES_PRICE_MAP = {
        'starter:month': process.env.STRIPE_PRICE_SALES_STARTER_MONTHLY,
        'starter:year':  process.env.STRIPE_PRICE_SALES_STARTER_ANNUAL,
        'pro:month':     process.env.STRIPE_PRICE_SALES_PRO_MONTHLY,
        'pro:year':      process.env.STRIPE_PRICE_SALES_PRO_ANNUAL,
      };

      const interval = String((req.body && req.body.interval) || 'month').toLowerCase();
      const priceKey = `${plan}:${interval}`;

      if (!(priceKey in SALES_PRICE_MAP)) {
        return res.status(400).json({ error: 'Invalid ClearDeals billing interval' });
      }

      const priceId = SALES_PRICE_MAP[priceKey];
      if (!priceId) {
        return res.status(500).json({ error: `Missing price ID for ClearDeals ${priceKey}` });
      }

      // 30-day free trial on the month-to-month plans only. Annual keeps billing
      // up front: a first-ever $997/$2,997 charge landing on day 31, with no
      // prior successful payment to prove the card, is the highest decline risk
      // in this funnel.
      const trialDays = interval === 'month' ? 30 : 0;

      sessionParams = {
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        // ── Cross-repo contract — read by ClearDeals, not just by this repo ──
        // ClearDeals (separate repo, same Stripe account) provisions dealership
        // accounts off checkout.session.completed, filtering on
        // `service === 'sales' && tier`. Renaming or dropping either key
        // silently stops account provisioning there, with no error on this side.
        //
        // `dealership_id` is RESERVED by ClearDeals to mark its in-app
        // usage-billing checkouts — never set it on a session created here.
        metadata: {
          service: 'sales',
          plan: `${plan}-${interval === 'year' ? 'annual' : 'monthly'}`,
          tier: plan,
          interval,
          trial_days: String(trialDays),
        },
        success_url: `${origin}/sales/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/sales/checkout-v2`,
      };

      if (trialDays) {
        // The trial lives on the session, not on the Price — the same four price
        // IDs stay reusable for non-trial subscriptions (sales-assisted signups,
        // migrations off the legacy /sales/checkout page).
        //
        // payment_method_collection stays at its 'always' default on purpose: the
        // usage subscription the dealer starts inside ClearDeals charges the card
        // saved here, so a trial that skipped card collection would leave that
        // in-app signup with nothing to bill.
        sessionParams.subscription_data = {
          trial_period_days: trialDays,
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        };
      }

    } else if (service === 'sales') {
      // ── /sales/checkout (legacy) ──
      // Testimonial promo waives the one-time setup fee. The server is the source
      // of truth — the page field is only a live-preview convenience.
      const SETUP_PROMO_CODE = (process.env.SALES_SETUP_PROMO_CODE || 'TESTIMONIAL').toUpperCase();
      const promo = String((req.body && req.body.promo) || '').trim().toUpperCase();
      const waiveSetup = promo === SETUP_PROMO_CODE;

      const lineItems = [
        { price: process.env.STRIPE_PRICE_SALES_LICENSE, quantity: 1 },
      ];

      if (!waiveSetup) {
        if (!process.env.STRIPE_PRICE_SALES_SETUP) {
          return res.status(500).json({ error: 'Missing STRIPE_PRICE_SALES_SETUP price ID' });
        }
        // One-time $1,000 setup fee — billed on the first invoice alongside the subscription.
        lineItems.unshift({ price: process.env.STRIPE_PRICE_SALES_SETUP, quantity: 1 });
      }

      sessionParams = {
        mode: 'subscription',
        line_items: lineItems,
        // The ABSENCE of `tier` here is load-bearing: it is how ClearDeals tells
        // these manually-onboarded customers apart from checkout-v2 buyers and
        // excludes them from auto-provisioning. Never add a `tier` key here.
        metadata: {
          service: 'sales',
          plan: 'monthly',
          setup_fee: waiveSetup ? 'waived' : '1000',
          promo: waiveSetup ? SETUP_PROMO_CODE : 'none',
        },
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
