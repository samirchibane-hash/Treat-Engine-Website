/**
 * One-off: create the $299 ClearDeals field tablet bundle — the Lenovo Idea Tab
 * 11" plus the attachable folio keyboard case — sold as a one-time add-on on
 * /sales/welcome, after the dealer's subscription is already signed.
 *
 * The price is one-time, not recurring, on purpose: api/tablet-order.js reads
 * its unit_amount and charges that once against the card Checkout saved, rather
 * than putting anything recurring on the dealer's subscription.
 *
 * Usage:  node scripts/create-tablet-price.js
 * Reads STRIPE_SECRET_KEY from the environment or from ../.env
 *
 * Copy the printed price ID into Vercel as STRIPE_PRICE_TABLET_BUNDLE, then redeploy.
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
  console.log(`Using ${mode} mode key. The product and price will be created in ${mode} mode —`);
  console.log(`make sure your Vercel STRIPE_SECRET_KEY is also ${mode}.\n`);

  const stripe = Stripe(key);

  // The apex domain 307s to www — Stripe fetches this server-side, so point it
  // straight at the canonical host instead of making it follow the redirect.
  //
  // shippable:true is what tells Stripe this is physical goods rather than more
  // software — it drives the Checkout summary and the risk signals on the
  // charge. Upload the product shot to /images/ before running this, or drop
  // the images array; a broken image URL renders as a gap in Checkout.
  const imageUrl = process.env.TABLET_IMAGE_URL
    || 'https://www.treatengine.com/images/lenovo-idea-tab-keyboard.png';

  const product = await stripe.products.create({
    name: 'ClearDeals Field Tablet — Lenovo Idea Tab 11" + Folio Keyboard',
    description: '11" 2.5K 90Hz Android tablet, bundled with the attachable folio keyboard case. Ships next business day. One-time purchase, not a rental — hardware is yours.',
    shippable: true,
    images: [imageUrl],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 29900,
    currency: 'usd',
    nickname: 'ClearDeals Field Tablet $299 one-time',
  });

  console.log(`✅  Tablet bundle $299 one-time  →  ${price.id}`);
  console.log('\n──────────────────────────────────────────────');
  console.log('Add this to Vercel → Settings → Environment Variables (Production), then redeploy:\n');
  console.log(`STRIPE_PRICE_TABLET_BUNDLE=${price.id}`);
  console.log('──────────────────────────────────────────────');
  console.log('\nStock is set by STOCK in lib/tablets.js — no env var. It is a');
  console.log('hand-maintained ceiling, not live inventory: lower it as units sell through.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
