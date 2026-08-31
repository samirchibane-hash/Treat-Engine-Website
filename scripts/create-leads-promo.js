/**
 * One-off: create the TRUEH20 promo code for Water Leads — 50% off the first
 * month of the /ads/checkout subscription.
 *
 * Usage:  node scripts/create-leads-promo.js
 * Reads STRIPE_SECRET_KEY from the environment or from ../.env
 *
 * Creates a percent-off coupon with duration 'once', which on a monthly
 * subscription discounts the FIRST invoice only — every renewal bills full
 * price. The discount applies across the whole first invoice, so add-ons
 * (Google Ads, appointment setters) are halved for month one too.
 *
 * Safe to re-run: if a promotion code with this name already exists it is
 * reported and nothing is created.
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

const CODE = 'TRUEH20';

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('❌  Set STRIPE_SECRET_KEY (or add it to .env) before running this script.');
    process.exit(1);
  }

  const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`Using ${mode} mode key. The promo code will be created in ${mode} mode —`);
  console.log(`make sure your Vercel STRIPE_SECRET_KEY is also ${mode}.\n`);

  const stripe = Stripe(key);

  const existing = await stripe.promotionCodes.list({ code: CODE, limit: 1 });
  if (existing.data.length) {
    const pc = existing.data[0];
    console.log(`ℹ️  Promotion code ${CODE} already exists — nothing created.`);
    console.log(`   ${pc.id} · active: ${pc.active} · coupon: ${pc.coupon.id} (${pc.coupon.percent_off}% off, ${pc.coupon.duration})`);
    return;
  }

  const coupon = await stripe.coupons.create({
    name: 'Water Leads — 50% off first month',
    percent_off: 50,
    duration: 'once',
  });

  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: CODE,
  });

  console.log('✅  Created the 50%-off-first-month promo code.\n');
  console.log('──────────────────────────────────────────────');
  console.log(`Coupon:          ${coupon.id}`);
  console.log(`Promotion code:  ${promo.id}  (customers type "${CODE}")`);
  console.log('──────────────────────────────────────────────');
  console.log('\nNothing to add to Vercel — /api/checkout looks the code up by name at checkout time.');
  console.log('To retire it later: Stripe Dashboard → Product catalog → Coupons → archive.');
}

main().catch(err => {
  console.error('❌  ' + err.message);
  process.exit(1);
});
