/**
 * One-off: create the $1,000 one-time "Dealership Setup & Customization"
 * price for Water Sales — ClearDeals, without touching any other product.
 *
 * Usage:  node scripts/create-setup-price.js
 * Reads STRIPE_SECRET_KEY from the environment or from ../.env
 *
 * Copy the printed price ID into Vercel as STRIPE_PRICE_SALES_SETUP, then redeploy.
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
  console.log(`Using ${mode} mode key. The price will be created in ${mode} mode —`);
  console.log(`make sure your Vercel STRIPE_SECRET_KEY is also ${mode}.\n`);

  const stripe = Stripe(key);

  const product = await stripe.products.create({
    name: 'ClearDeals — Setup & Customization',
    description: 'One-time setup: custom contract, branded presentation, product catalog, and team training.',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 100000, // $1,000.00
    currency: 'usd',
    nickname: 'Water Sales ClearDeals Setup $1,000 one-time',
  });

  console.log('✅  Created $1,000 one-time setup price.\n');
  console.log('──────────────────────────────────────────────');
  console.log('Add this to Vercel → Settings → Environment Variables (Production), then redeploy:\n');
  console.log(`STRIPE_PRICE_SALES_SETUP=${price.id}`);
  console.log('──────────────────────────────────────────────');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
