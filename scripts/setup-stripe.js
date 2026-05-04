/**
 * Run this once to create all Stripe products and prices.
 * Usage: STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.js
 *
 * Copy the output price IDs into your Vercel environment variables.
 */

const Stripe = require('stripe');

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

  // ── Water Leads — $1,500/month ────────────────────────────────────────────
  const leadsProduct = await stripe.products.create({
    name: 'Water Leads',
    description: 'Exclusive lead generation & appointment booking for water treatment dealers.',
  });
  const leadsPrice = await stripe.prices.create({
    product: leadsProduct.id,
    unit_amount: 150000,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Water Leads Monthly',
  });
  results.STRIPE_PRICE_LEADS_MONTHLY = leadsPrice.id;
  console.log(`✅  Water Leads $1,500/mo  →  ${leadsPrice.id}`);

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

  // ── Water Sales — $10,000 annual license ─────────────────────────────────
  // Per-agreement usage fees (invoiced separately, monthly):
  //   1–100:        $7.00/agreement
  //   101–500:      $5.50/agreement
  //   501–2,000:    $4.25/agreement
  //   2,001–5,000:  $3.75/agreement
  //   5,001–10,000: $3.50/agreement
  //   10,000+:      $3.25/agreement
  const salesProduct = await stripe.products.create({
    name: 'Water Sales — ClearDeals',
    description: 'Annual license for the ClearDeals in-field proposal and closing platform. Unlimited users. Per-agreement usage billed monthly.',
  });
  const salesLicensePrice = await stripe.prices.create({
    product: salesProduct.id,
    unit_amount: 1000000,
    currency: 'usd',
    nickname: 'Water Sales Annual License',
  });
  results.STRIPE_PRICE_SALES_LICENSE = salesLicensePrice.id;
  console.log(`✅  Water Sales $10,000 license  →  ${salesLicensePrice.id}`);

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
