const Stripe = require('stripe');

// Two Stripe accounts, side by side.
//
//   Treat Engine, Inc  (STRIPE_TE_SECRET_KEY) — every NEW checkout from the
//                       credits cutover on: ClearDeals plans, Leads, tablets.
//   eComm Inc          (STRIPE_SECRET_KEY)    — everything already running there
//                       keeps renewing untouched, and a checkout someone opened
//                       before the cutover still completes there.
//
// Checkout session IDs don't say which account they belong to, so anything that
// reads a session back (welcome, onboarding, tablet add-on) asks Treat Engine
// first and falls back to eComm.

let te = null;
let ecomm = null;

function teStripe() {
  if (!process.env.STRIPE_TE_SECRET_KEY) throw new Error('STRIPE_TE_SECRET_KEY is not set');
  if (!te) te = Stripe(process.env.STRIPE_TE_SECRET_KEY);
  return te;
}

function ecommStripe() {
  if (!ecomm) ecomm = Stripe(process.env.STRIPE_SECRET_KEY);
  return ecomm;
}

function stripeFor(account) {
  return account === 'te' ? teStripe() : ecommStripe();
}

/** Reads a checkout session from whichever account has it: { session, account, stripe }. */
async function retrieveCheckoutSession(sessionId, params) {
  try {
    const stripe = teStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, params);
    return { session, account: 'te', stripe };
  } catch (err) {
    if (err && err.code !== 'resource_missing') throw err;
  }
  const stripe = ecommStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, params);
  return { session, account: 'ecomm', stripe };
}

// The Treat Engine, Inc prices. Not secrets and fixed per account, so they live
// here instead of in env vars (which still hold the eComm IDs the legacy
// branches and pre-cutover sessions use). Keep in step with the Stripe dashboard.
const TE_PRICES = {
  sales: {
    'starter:month': 'price_1UTYbAPiTur7prN4uG9ibJuK',
    'starter:year': 'price_1UTYbEPiTur7prN4qZUvJvnx',
    'pro:month': 'price_1UTYbHPiTur7prN4Jiy2kPRP',
    'pro:year': 'price_1UTYbXPiTur7prN4ZU32ZSMh',
  },
  leads: {
    meta_ads: 'price_1UTYfkPiTur7prN4wOfRyzDI',
    crm: 'price_1UTYfmPiTur7prN4yZPX7wga',
    google_ads: 'price_1UTYfoPiTur7prN4e8zZU5n2',
    appointment_setters_pt: 'price_1UTYfqPiTur7prN4uO40DfSl',
    appointment_setters_ft: 'price_1UTYfyPiTur7prN4oOvyqj79',
  },
  tabletBundle: 'price_1UTYfsPiTur7prN4tNbQXWi7',
};

/** The tablet bundle price on a given account (eComm's still comes from env). */
function tabletPriceId(account) {
  return account === 'te' ? TE_PRICES.tabletBundle : process.env.STRIPE_PRICE_TABLET_BUNDLE;
}

module.exports = { teStripe, ecommStripe, stripeFor, retrieveCheckoutSession, TE_PRICES, tabletPriceId };
