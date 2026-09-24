// Forwards pre-checkout leads to whatever runs the abandoned-cart follow-up
// (a GoHighLevel inbound-webhook trigger, Zapier, etc.) — the site doesn't
// send the emails itself. The CRM's `clients` table is deliberately NOT used:
// it is the paying-customer ledger, and /admin lists every row in it.
//
// Every event shares one flat payload so a single workflow can branch on
// `event`:
//   lead_captured      — dealer finished step 1 of /sales-v2/start (contact only)
//   checkout_started   — dealer finished step 2 and was sent to Stripe
//   checkout_abandoned — the Stripe session expired unpaid (carries recovery_url)
//   checkout_completed — they paid; stop the sequence
//   checkout_error     — Stripe refused to create the session; follow up by hand
//
// parseLead is shared by api/lead.js (step 1) and api/checkout.js (step 2).
//
// Never throws. A lead hook that is down or unset must not cost us the checkout.
const { BRAND_PRODUCT_COUNTS } = require('./brand-catalog');

async function postLead(event, lead) {
  const url = (process.env.LEAD_WEBHOOK_URL || '').trim();
  if (!url) {
    console.warn(`LEAD_WEBHOOK_URL unset — dropped ${event} for ${lead.email || 'unknown'}`);
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, occurred_at: new Date().toISOString(), ...lead }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error(`Lead webhook ${event} returned ${res.status}`);
  } catch (err) {
    console.error(`Lead webhook ${event} failed:`, err.message);
  }
}

// Rebuilds the lead from a Checkout Session's metadata, so the webhook events
// carry the same fields as checkout_started without a database in between.
function leadFromSession(session) {
  const m = session.metadata || {};
  const name = m.lead_name || session.customer_details?.name || '';
  return {
    name,
    first_name: name.split(/\s+/)[0] || '',
    email: session.customer_details?.email || session.customer_email || '',
    phone: session.customer_details?.phone || m.lead_phone || '',
    sms_consent: m.sms_consent === 'yes',
    dealership: m.dealership_name || '',
    website: m.website || '',
    // Metadata stores "A,B" for ClearDeals; the lead payload reads "A, B".
    brands: (m.brands || '').split(',').filter(Boolean).join(', '),
    product_count: Number(m.product_count) || 0,
    plan: m.tier || '',
    interval: m.interval || '',
    source: m.lead_source || '',
    stripe_session_id: session.id,
  };
}

// The dealer details collected on /sales-v2/start, or null when the request
// came straight from a pricing card (/sales, /sales/checkout-v2). Returns
// { error } when a lead was sent but is unusable. Every value is clipped to
// fit Stripe's 500-character metadata limit.
function parseLead(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const clip = (v, n = 200) => String(v || '').trim().slice(0, n);

  const lead = {
    name: clip(raw.name),
    email: clip(raw.email).toLowerCase(),
    phone: clip(raw.phone, 40),
    dealership: clip(raw.dealership),
    website: clip(raw.website),
    sms_consent: raw.smsConsent === true,
    // Only known libraries — this list goes to ClearDeals' catalog import.
    brands: [...new Set([].concat(raw.brands || []))]
      .filter(b => Object.prototype.hasOwnProperty.call(BRAND_PRODUCT_COUNTS, b)),
    source: clip(raw.source, 40) || 'sales-v2',
  };

  if (!lead.name || !lead.dealership) return { error: 'Please add your name and dealership.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { error: 'Please enter a valid email.' };

  lead.product_count = lead.brands.reduce((n, b) => n + BRAND_PRODUCT_COUNTS[b], 0);
  return lead;
}

module.exports = { postLead, leadFromSession, parseLead };
