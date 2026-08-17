/**
 * One-off: create the two-tier ClearDeals pricing used by /sales/checkout-v2 —
 * Starter and Pro, each with a monthly and an annual price. Does not touch any
 * other product, and does not archive the $299/mo license or the $1,000 setup
 * price, which the original /sales/checkout page still charges.
 *
 * Usage:  node scripts/create-cleardeals-prices.js
 * Reads STRIPE_SECRET_KEY from the environment or from ../.env
 *
 * Copy the four printed price IDs into Vercel, then redeploy.
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
    console.error('❌  Set STRIPE_SECRET_KEY (or add it to .env) before running this script.');
    process.exit(1);
  }

  const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`Using ${mode} mode key. Prices will be created in ${mode} mode —`);
  console.log(`make sure your Vercel STRIPE_SECRET_KEY is also ${mode}.\n`);

  const stripe = Stripe(key);
  const results = {};

  // ── ClearDeals Starter — residential, 1 location, 5 offices ──────────────
  const starterProduct = await stripe.products.create({
    name: 'ClearDeals — Starter',
    description: 'In-field proposal and closing platform for residential water treatment deals. Unlimited users, 1 location, up to 5 offices. Per-document usage billed at month-end.',
  });

  const starterMonthly = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 9700,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'ClearDeals Starter $97/mo',
  });
  results.STRIPE_PRICE_SALES_STARTER_MONTHLY = starterMonthly.id;
  console.log(`✅  ClearDeals Starter $97/mo  →  ${starterMonthly.id}`);

  const starterAnnual = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 99700,
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'ClearDeals Starter $997/yr',
  });
  results.STRIPE_PRICE_SALES_STARTER_ANNUAL = starterAnnual.id;
  console.log(`✅  ClearDeals Starter $997/yr  →  ${starterAnnual.id}`);

  // ── ClearDeals Pro — adds commercial coolers, rentals, unlimited scope ────
  const proProduct = await stripe.products.create({
    name: 'ClearDeals — Pro',
    description: 'Everything in Starter plus commercial cooler deals, rentals pricing, unlimited locations, and unlimited offices. Per-document usage billed at month-end.',
  });

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 29700,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'ClearDeals Pro $297/mo',
  });
  results.STRIPE_PRICE_SALES_PRO_MONTHLY = proMonthly.id;
  console.log(`✅  ClearDeals Pro $297/mo  →  ${proMonthly.id}`);

  const proAnnual = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 299700,
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'ClearDeals Pro $2,997/yr',
  });
  results.STRIPE_PRICE_SALES_PRO_ANNUAL = proAnnual.id;
  console.log(`✅  ClearDeals Pro $2,997/yr  →  ${proAnnual.id}`);

  console.log('\n──────────────────────────────────────────────');
  console.log('Add these to Vercel → Settings → Environment Variables (Production), then redeploy:\n');
  for (const [envKey, val] of Object.entries(results)) {
    console.log(`${envKey}=${val}`);
  }
  console.log('──────────────────────────────────────────────');
  console.log('\nThese power /sales/checkout-v2 only. The original /sales/checkout still');
  console.log('uses STRIPE_PRICE_SALES_LICENSE and STRIPE_PRICE_SALES_SETUP — leave those in');
  console.log('place until you retire that page.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
