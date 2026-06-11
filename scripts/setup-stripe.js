/**
 * Run this once to create all Stripe products and prices.
 * Usage: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.js
 *
 * Copy the output price IDs into your Vercel environment variables.
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Load .env from project root if STRIPE_SECRET_KEY isn't already set
if (!process.env.STRIPE_SECRET_KEY) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) {
        const val = rest.join('=').split('#')[0].trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = val;
      }
    });
  }
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('❌  Set STRIPE_SECRET_KEY before running this script.');
    process.exit(1);
  }
  if (!key.startsWith('sk_live_')) {
    console.warn('⚠️  Warning: this does not look like a live key. Proceeding anyway…\n');
  }

  const stripe = Stripe(key);
  const results = {};

  console.log('Creating Stripe products and prices…\n');

  // ── Water Leads — Meta Ads Management ($599/month) ───────────────────────
  const leadsMetaProduct = await stripe.products.create({
    name: 'Water Leads — Meta Ads Management',
    description: '2 new video ads + 3 new image ads per month, unlimited optimizations, territory exclusivity.',
  });
  const leadsMetaPrice = await stripe.prices.create({
    product: leadsMetaProduct.id,
    unit_amount: 59900,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads Meta Ads $599/mo',
  });
  results.STRIPE_PRICE_LEADS_META_ADS = leadsMetaPrice.id;
  console.log(`✅  Water Leads Meta Ads $599/mo  →  ${leadsMetaPrice.id}`);

  // ── Water Leads — Treat Engine CRM ($199/month) ───────────────────────────
  const leadsCrmProduct = await stripe.products.create({
    name: 'Water Leads — Treat Engine CRM',
    description: 'Email & SMS flows, calendar & phone system, AI voice agent, tracking & reporting, unlimited users.',
  });
  const leadsCrmPrice = await stripe.prices.create({
    product: leadsCrmProduct.id,
    unit_amount: 19900,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads CRM $199/mo',
  });
  results.STRIPE_PRICE_LEADS_CRM = leadsCrmPrice.id;
  console.log(`✅  Water Leads CRM $199/mo  →  ${leadsCrmPrice.id}`);

  // ── Water Leads — Appointment Setters ($699 PT / $1,300 FT per month) ─────
  const leadsApptProduct = await stripe.products.create({
    name: 'Water Leads — Appointment Setters',
    description: 'Trained callers who follow up with new leads instantly and book pre-qualified water test appointments.',
  });
  const leadsApptPtPrice = await stripe.prices.create({
    product: leadsApptProduct.id,
    unit_amount: 69900,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads Appt Setters Part-Time $699/mo',
  });
  results.STRIPE_PRICE_LEADS_APPT_SETTERS_PT = leadsApptPtPrice.id;
  console.log(`✅  Water Leads Appt Setters PT $699/mo  →  ${leadsApptPtPrice.id}`);

  const leadsApptFtPrice = await stripe.prices.create({
    product: leadsApptProduct.id,
    unit_amount: 130000,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads Appt Setters Full-Time $1,300/mo',
  });
  results.STRIPE_PRICE_LEADS_APPT_SETTERS_FT = leadsApptFtPrice.id;
  console.log(`✅  Water Leads Appt Setters FT $1,300/mo  →  ${leadsApptFtPrice.id}`);

  // ── Water Leads — Google Ads Management ($799/month) ─────────────────────
  const leadsGoogleProduct = await stripe.products.create({
    name: 'Water Leads — Google Ads Management',
    description: 'Done-for-you Google Search campaigns targeting homeowners actively searching for water filtration systems.',
  });
  const leadsGooglePrice = await stripe.prices.create({
    product: leadsGoogleProduct.id,
    unit_amount: 79900,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads Google Ads $799/mo',
  });
  results.STRIPE_PRICE_LEADS_GOOGLE_ADS = leadsGooglePrice.id;
  console.log(`✅  Water Leads Google Ads $799/mo  →  ${leadsGooglePrice.id}`);

  // ── Water Websites — $1,799 one-time ─────────────────────────────────────
  const websitesProduct = await stripe.products.create({
    name: 'Water Websites',
    description: 'Conversion-optimized website built for water treatment dealers.',
  });
  const websitesOnetimePrice = await stripe.prices.create({
    product: websitesProduct.id,
    unit_amount: 179900,
    currency: 'usd',
    nickname: 'Water Websites One-time',
  });
  results.STRIPE_PRICE_WEBSITES_ONETIME = websitesOnetimePrice.id;
  console.log(`✅  Water Websites $1,799 one-time  →  ${websitesOnetimePrice.id}`);

  // ── Water Websites — $997/month installment (2 payments) ─────────────────
  const websitesInstallmentPrice = await stripe.prices.create({
    product: websitesProduct.id,
    unit_amount: 99700,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Websites Installment $997×2',
  });
  results.STRIPE_PRICE_WEBSITES_INSTALLMENT = websitesInstallmentPrice.id;
  console.log(`✅  Water Websites $997×2 installment  →  ${websitesInstallmentPrice.id}`);

  // ── Water Sales — ClearDeals $299/month ──────────────────────────────────
  // Per-agreement usage fees are metered and invoiced separately at month-end.
  const salesProduct = await stripe.products.create({
    name: 'Water Sales — ClearDeals',
    description: 'ClearDeals in-field proposal and closing platform. Unlimited users. Per-agreement usage billed at month-end.',
  });
  const salesMonthlyPrice = await stripe.prices.create({
    product: salesProduct.id,
    unit_amount: 29900,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Sales ClearDeals $299/mo',
  });
  results.STRIPE_PRICE_SALES_MONTHLY = salesMonthlyPrice.id;
  console.log(`✅  Water Sales ClearDeals $299/mo  →  ${salesMonthlyPrice.id}`);
  // Note: price_1TVwD9EOMGuonbJbBStlFxqt is the existing live price — only run this if creating fresh

  // ── Water Sales — One-time setup & customization ($1,000) ────────────────
  // Customizes ClearDeals to the dealership: contract, presentation, product
  // catalog, and team training. Billed once on the first subscription invoice.
  const salesSetupPrice = await stripe.prices.create({
    product: salesProduct.id,
    unit_amount: 100000,
    currency: 'usd',
    nickname: 'Water Sales ClearDeals Setup $1,000 one-time',
  });
  results.STRIPE_PRICE_SALES_SETUP = salesSetupPrice.id;
  console.log(`✅  Water Sales Setup $1,000 one-time  →  ${salesSetupPrice.id}`);

  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('Add these to your Vercel environment variables:\n');
  for (const [key, val] of Object.entries(results)) {
    console.log(`${key}=${val}`);
  }
  console.log('\nDone! ✨');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
