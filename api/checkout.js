const { teStripe, ecommStripe, TE_PRICES } = require('../lib/stripe');
const { postLead, parseLead, ATTRIBUTION_KEYS } = require('../lib/leads');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // New sales (ClearDeals plans, Leads) check out on Treat Engine, Inc. The
  // legacy /sales/checkout page and Websites still sell eComm prices, so they
  // stay there. See lib/stripe.js.
  let stripe = ecommStripe();
  const origin = process.env.SITE_URL || `https://${req.headers.host}`;

  const { service, plan } = req.body || {};
  let lead = null;

  try {
    let sessionParams;

    if (service === 'leads') {
      const VALID_ADDONS = new Set(['google_ads', 'appointment_setters_pt', 'appointment_setters_ft']);
      const rawAddons = Array.isArray(req.body.addons) ? req.body.addons : [];
      const addons = rawAddons.filter(a => VALID_ADDONS.has(a));

      if (addons.includes('appointment_setters_pt') && addons.includes('appointment_setters_ft')) {
        return res.status(400).json({ error: 'Cannot select both appointment setter tiers' });
      }

      stripe = teStripe();
      // Meta Ads + the Treat Engine CRM are always included.
      const lineItems = [
        { price: TE_PRICES.leads.meta_ads, quantity: 1 },
        { price: TE_PRICES.leads.crm, quantity: 1 },
      ];

      const ADDON_PRICE_MAP = {
        google_ads:             TE_PRICES.leads.google_ads,
        appointment_setters_pt: TE_PRICES.leads.appointment_setters_pt,
        appointment_setters_ft: TE_PRICES.leads.appointment_setters_ft,
      };

      for (const addon of addons) {
        const priceId = ADDON_PRICE_MAP[addon];
        if (!priceId) return res.status(500).json({ error: `Missing price ID for addon: ${addon}` });
        lineItems.push({ price: priceId, quantity: 1 });
      }

      // ── /ads/checkout-q: first 90 days paid up front ──
      // Same monthly prices, then month-to-month. The checkout is a one-time
      // payment: each service × 3, amount read off the live Price so the two
      // pages can't drift. api/webhook.js then starts the monthly subscription
      // on the saved card with a 90-day trial, so its first charge lands on
      // day 91. Not a subscription-mode checkout with a trial: Stripe's page
      // would list every service twice, half of them as "90 days free".
      const prepay = req.body.term === '90';
      const PREPAY_DAYS = 90;
      const PREPAY_MONTHS = 3;
      let prepayItems = null;
      let monthlyCents = 0;

      if (prepay) {
        const prices = await Promise.all(lineItems.map(li => stripe.prices.retrieve(li.price)));
        prepayItems = [];
        for (const p of prices) {
          if (p.unit_amount == null) return res.status(500).json({ error: `Price ${p.id} has no flat amount` });
          monthlyCents += p.unit_amount;
          prepayItems.push({
            price_data: { currency: p.currency, product: p.product, unit_amount: p.unit_amount },
            quantity: PREPAY_MONTHS,
          });
        }
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
      //
      // Never on the 90-day prepay: a 'once' coupon would discount all three
      // prepaid months, not one.
      const promo = prepay ? '' : String(req.body.promo || '').trim().toUpperCase();
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
          plan: prepay ? 'prepay-90' : 'ala-carte',
          addons: addons.join(',') || 'none',
          promo: promo || 'none',
        },
        success_url: `${origin}/ads/onboarding?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${prepay ? '/ads/checkout-q' : '/ads/checkout'}`,
      };

      if (prepay) {
        Object.assign(sessionParams, {
          mode: 'payment',
          line_items: prepayItems,
          customer_creation: 'always',
          payment_intent_data: { setup_future_usage: 'off_session' },
        });
        // api/webhook.js subscribes the customer to exactly these prices.
        sessionParams.metadata.prepay_days = String(PREPAY_DAYS);
        sessionParams.metadata.subscription_prices = lineItems.map(li => li.price).join(',');
        const monthly = (monthlyCents / 100).toLocaleString('en-US', { minimumFractionDigits: monthlyCents % 100 ? 2 : 0 });
        sessionParams.custom_text = {
          submit: {
            message: `Today's payment covers your first ${PREPAY_DAYS} days. From day ${PREPAY_DAYS + 1} ` +
              `it's $${monthly}/month on this card, month-to-month.`,
          },
        };
      }

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
      stripe = teStripe();
      const SALES_PRICE_MAP = TE_PRICES.sales;

      const interval = String((req.body && req.body.interval) || 'month').toLowerCase();
      const priceKey = `${plan}:${interval}`;

      if (!Object.prototype.hasOwnProperty.call(SALES_PRICE_MAP, priceKey)) {
        return res.status(400).json({ error: 'Invalid ClearDeals billing interval' });
      }

      const priceId = SALES_PRICE_MAP[priceKey];
      if (!priceId) {
        return res.status(500).json({ error: `Missing price ID for ClearDeals ${priceKey}` });
      }

      // 30-day free trial on the month-to-month plans only. Annual keeps billing
      // up front: a first-ever $997/$2,999 charge landing on day 31, with no
      // prior successful payment to prove the card, is the highest decline risk
      // in this funnel.
      const trialDays = interval === 'month' ? 30 : 0;

      // Nothing but the plan goes in this session. The field tablet add-on used
      // to ride along here as a one-time line item, sold by a modal that stood
      // between the dealer and this redirect; it now lives on /sales/welcome
      // (api/tablet-order.js), where saying no can't cost us the subscription.
      const lineItems = [{ price: priceId, quantity: 1 }];

      sessionParams = {
        mode: 'subscription',
        line_items: lineItems,
        // ── Cross-repo contract — read by ClearDeals, not just by this repo ──
        // ClearDeals (separate repo, same Stripe accounts) provisions dealership
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
        // Stripe's back link. /sales is the main page, whichever page the
        // dealer started from.
        cancel_url: `${origin}/sales`,
      };

      if (trialDays) {
        // The trial lives on the session, not on the Price — the same four price
        // IDs stay reusable for non-trial subscriptions (sales-assisted signups,
        // migrations off the legacy /sales/checkout page).
        //
        // payment_method_collection stays at its 'always' default on purpose: the
        // plan bills this card after the trial, and ClearDeals' credit packs and
        // auto-reload can reuse it.
        sessionParams.subscription_data = {
          trial_period_days: trialDays,
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        };
      }

      // ── Pre-checkout lead (/sales/start and /sales-v2/start) ──
      // Sessions without a lead (/sales/checkout-v2) are left exactly as they were.
      lead = parseLead(req.body.lead);
      if (lead && lead.error) return res.status(400).json({ error: lead.error });

      // ── Straight from a pricing card (/sales buy boxes) ──
      // No opt-in, so no lead — but keep the ad attribution on the session so
      // UTMs and click IDs still reach Stripe metadata, and send Stripe's back
      // link to the page the dealer came from. Additive only: no `lead_source`,
      // so api/webhook.js sends no lead events for these sessions.
      if (!lead) {
        const attribution = (req.body && typeof req.body.attribution === 'object' && req.body.attribution) || {};
        for (const k of ATTRIBUTION_KEYS) {
          const v = String(attribution[k] || '').trim().slice(0, 500);
          if (v) sessionParams.metadata[k] = v;
        }
        const RETURN_PATHS = new Set(['/sales', '/sales-v2']);
        if (RETURN_PATHS.has(req.body && req.body.return_path)) {
          sessionParams.cancel_url = `${origin}${req.body.return_path}#pricing`;
        }
      }

      if (lead) {
        const { brands, product_count } = lead;
        sessionParams.customer_email = lead.email;

        // Adds to the cross-repo contract above, never renames: ClearDeals
        // can read these to prefill Profile, Company details and the brand
        // import. `brands` holds exact library names from lib/brand-catalog.js.
        Object.assign(sessionParams.metadata, {
          lead_source: lead.source,
          lead_name: lead.name,
          lead_phone: lead.phone,
          sms_consent: lead.sms_consent ? 'yes' : 'no',
          dealership_name: lead.dealership,
          website: lead.website,
          brands: brands.join(','),
          product_count: String(product_count),
        });
        // UTMs and click IDs, only when present — the webhook reads them back
        // for checkout_completed / checkout_abandoned.
        for (const k of ATTRIBUTION_KEYS) {
          if (lead[k]) sessionParams.metadata[k] = lead[k];
        }

        // Expired sessions get a recovery link, delivered to the lead webhook
        // by api/webhook.js on checkout.session.expired.
        sessionParams.after_expiration = { recovery: { enabled: true } };

        // Back from Stripe lands on the filled-in brands step, not the top of /sales.
        const startPage = lead.source === 'sales-v2' ? '/sales-v2/start' : '/sales/start';
        sessionParams.cancel_url =
          `${origin}${startPage}?plan=${plan}&interval=${interval}&step=2`;

        if (product_count) {
          const list = brands.map(b => (b === 'Generic' ? 'independent-dealer library' : b)).join(', ');
          sessionParams.custom_text = {
            submit: {
              message: `We'll load ${product_count} products (${list}) into ${lead.dealership}'s ` +
                'ClearDeals catalog during setup. You just add your prices.',
            },
          };
        }
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

    // Awaited so the serverless function isn't frozen mid-request; postLead
    // times out at 4s and never throws, so it can't block the redirect.
    if (lead) {
      await postLead('checkout_started', {
        ...lead,
        first_name: lead.name.split(/\s+/)[0],
        brands: lead.brands.join(', '),
        plan,
        interval: sessionParams.metadata.interval,
        checkout_url: session.url,
        stripe_session_id: session.id,
      });
    }

    res.json({ url: session.url });

  } catch (err) {
    console.error('Checkout error:', err.message);
    // Stripe failed but the dealer still told us who they are — keep the lead.
    if (lead && !lead.error) await postLead('checkout_error', { ...lead, brands: lead.brands.join(', '), plan });
    res.status(500).json({ error: err.message });
  }
};
