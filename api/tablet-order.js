const Stripe = require('stripe');
const { STOCK, PRICE } = require('../lib/tablets');

/**
 * POST /api/tablet-order   { session_id, quantity, shipping? }
 *
 * The buy button on /sales/welcome. The dealer finished Checkout seconds ago,
 * so their card is already saved against the subscription — this charges it
 * off-session instead of sending them through Stripe a second time. That is the
 * whole reason the offer moved here from the pre-checkout modal: the card is on
 * file, so the add-on costs one click and can never cost us the subscription.
 *
 * ── One order per checkout session ──
 * Once this succeeds the quantity is written to the subscription's metadata,
 * /api/verify-session reports it, and the welcome page renders the confirmed
 * card instead of the offer — so the dealer is never shown a second buy button.
 * The 409 below is the durable guard behind that; the idempotency key only
 * covers the double-click window (Stripe expires keys after 24h). A dealer who
 * wants more tablets later emails us — deliberately not self-serve, because a
 * second silent off-session charge days after checkout is exactly the kind of
 * surprise that produces a dispute.
 *
 * ── Fulfilment ──
 * What to put in a box, and where to send it, is read off the PaymentIntent in
 * the Stripe Dashboard: metadata.kind === 'tablet_order', metadata.tablets, and
 * the shipping address on the intent itself. Search PaymentIntents by that
 * metadata key to get the day's shipping list.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.SITE_URL || `https://${req.headers.host}`;

  const sessionId = String((req.body && req.body.session_id) || '').trim();
  const quantity  = Number.parseInt(req.body && req.body.quantity, 10);

  if (!sessionId) return res.status(400).json({ error: 'Missing session_id' });
  if (!(quantity >= 1 && quantity <= STOCK)) {
    return res.status(400).json({ error: 'That tablet quantity isn’t available.' });
  }
  if (!process.env.STRIPE_PRICE_TABLET_BUNDLE) {
    console.error('Tablet order: STRIPE_PRICE_TABLET_BUNDLE is not set');
    return res.status(500).json({ error: 'Tablet ordering is not configured.' });
  }

  try {
    // The session id is the only thing the browser sends that identifies the
    // buyer, so everything else — customer, card, price, address — is read back
    // from Stripe here. Nothing about the charge is taken from the request body
    // except the quantity, which is bounded above.
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.default_payment_method', 'customer'],
    });

    const settled =
      session.status === 'complete' ||
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required';

    if (!settled || session.metadata?.service !== 'sales') {
      return res.status(403).json({ error: 'That checkout isn’t eligible for this add-on.' });
    }

    const sub = session.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null;

    const already = Number.parseInt(sub?.metadata?.tablets || '0', 10) || 0;
    if (already > 0) {
      return res.status(409).json({
        error: 'Tablets have already been ordered on this account.',
        quantity: already,
      });
    }

    // ── Price ──
    // The charge is built from the live Stripe price, never from PRICE. But if
    // the two disagree, the page has been quoting a number we're about to not
    // charge — refuse rather than surprise the dealer in either direction.
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_TABLET_BUNDLE);
    if (price.unit_amount !== PRICE * 100) {
      console.error(
        `Tablet price drift: Stripe says ${price.unit_amount}, lib/tablets.js says ${PRICE * 100}`
      );
      return res.status(500).json({ error: 'Tablet pricing is being updated — please contact us.' });
    }

    const customerId = typeof session.customer === 'object' && session.customer
      ? session.customer.id
      : session.customer;

    if (!customerId) {
      return res.status(403).json({ error: 'That checkout isn’t eligible for this add-on.' });
    }

    // ── Shipping ──
    // No-tablet checkouts never collected a shipping address, only a billing
    // one. The page prefills billing and lets the dealer correct it; whatever
    // comes back is used, and billing is the fallback if they sent nothing.
    const shipping = normalizeShipping(req.body && req.body.shipping, session);
    if (!shipping) {
      return res.status(400).json({ error: 'We need a US shipping address for the tablets.' });
    }

    const paymentMethodId = resolvePaymentMethod(sub, session);

    const metadata = {
      kind: 'tablet_order',
      service: 'sales',
      tablets: String(quantity),
      checkout_session: sessionId,
      subscription: sub?.id || '',
    };

    // No saved card to charge (shouldn't happen — Checkout collects one even on
    // the $0 trial) means there is nothing to do off-session. Fall through to
    // the hosted-checkout path, same as a card that wants 3-D Secure.
    if (!paymentMethodId) {
      return res.json(await hostedFallback(stripe, { customerId, quantity, metadata, sessionId, origin }));
    }

    let intent;
    try {
      intent = await stripe.paymentIntents.create({
        amount: price.unit_amount * quantity,
        currency: price.currency,
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `ClearDeals field tablet bundle × ${quantity}`,
        shipping,
        metadata,
      }, {
        // Covers the double-click: two requests for the same checkout session
        // return the same PaymentIntent instead of billing twice. The 409 above
        // is what covers the days-later case, once this key has expired.
        idempotencyKey: `tablet-order:${sessionId}`,
      });
    } catch (err) {
      // A card that needs 3-D Secure can't be charged off-session — it needs the
      // dealer present. Rather than dead-end a $299 sale, hand them a hosted
      // Stripe page that can prompt for it. Plain declines are reported as-is.
      if (err.code === 'authentication_required') {
        return res.json(await hostedFallback(stripe, { customerId, quantity, metadata, sessionId, origin }));
      }
      if (err.type === 'StripeCardError') {
        return res.status(402).json({
          error: err.message || 'Your card was declined.',
          declined: true,
        });
      }
      throw err;
    }

    if (intent.status !== 'succeeded') {
      return res.json(await hostedFallback(stripe, { customerId, quantity, metadata, sessionId, origin }));
    }

    await recordOrder(stripe, { sub, sessionId, quantity, reference: intent.id });

    const card = cardSummary(sub, session);
    res.json({
      ok: true,
      quantity,
      amount: intent.amount,
      cardBrand: card.brand,
      cardLast4: card.last4,
    });

  } catch (err) {
    console.error('Tablet order error:', err.message);
    res.status(500).json({ error: 'We couldn’t complete that order. Please try again.' });
  }
};

/**
 * Writes the order onto the subscription so /api/verify-session can report it
 * on every later page load — that metadata, not the PaymentIntent, is what
 * stops the dealer being offered tablets twice.
 *
 * Best-effort on the session copy: checkout.sessions.update only accepts
 * metadata, and losing it costs us a convenience, not the record. The charge
 * has already gone through by this point, so nothing here may throw.
 */
async function recordOrder(stripe, { sub, sessionId, quantity, reference }) {
  if (sub) {
    try {
      await stripe.subscriptions.update(sub.id, {
        metadata: { ...(sub.metadata || {}), tablets: String(quantity), tablet_order: reference },
      });
    } catch (err) {
      console.error('Tablet order: subscription metadata update failed:', err.message);
    }
  }
  try {
    await stripe.checkout.sessions.update(sessionId, {
      metadata: { tablets: String(quantity), tablet_order: reference },
    });
  } catch (err) {
    console.error('Tablet order: session metadata update failed:', err.message);
  }
}

/**
 * The card is present and the dealer isn't — or there's no card at all. A
 * payment-mode Checkout Session puts them in front of Stripe, which can run
 * 3-D Secure and collect the shipping address itself.
 *
 * api/webhook.js finishes this path on checkout.session.completed, keying on
 * metadata.kind === 'tablet_order'.
 */
async function hostedFallback(stripe, { customerId, quantity, metadata, sessionId, origin }) {
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_TABLET_BUNDLE, quantity }],
    shipping_address_collection: { allowed_countries: ['US'] },
    metadata,
    success_url: `${origin}/sales/welcome?session_id=${encodeURIComponent(sessionId)}`,
    cancel_url: `${origin}/sales/welcome?session_id=${encodeURIComponent(sessionId)}`,
  });
  return { ok: false, redirectUrl: checkout.url, reason: 'confirmation_required' };
}

/** Checkout's saved card, in the order Stripe is most likely to have set it. */
function resolvePaymentMethod(sub, session) {
  const fromSub = sub?.default_payment_method;
  if (fromSub) return typeof fromSub === 'object' ? fromSub.id : fromSub;

  const customer = typeof session.customer === 'object' ? session.customer : null;
  const fromCustomer = customer?.invoice_settings?.default_payment_method;
  if (fromCustomer) return typeof fromCustomer === 'object' ? fromCustomer.id : fromCustomer;

  return null;
}

/** Brand and last4 for the receipt line, when Stripe expanded far enough to know. */
function cardSummary(sub, session) {
  const pm = sub?.default_payment_method;
  if (pm && typeof pm === 'object' && pm.card) {
    return { brand: titleCase(pm.card.brand), last4: pm.card.last4 };
  }
  return { brand: null, last4: null };
}

function titleCase(s) {
  if (!s) return null;
  if (s === 'amex') return 'American Express';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Accepts the address the page posted, falling back to the billing address
 * Stripe already collected. Returns null when neither is complete enough to
 * put on a shipping label — the caller turns that into a 400 rather than
 * shipping a $299 tablet into a void.
 */
function normalizeShipping(input, session) {
  const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 200);

  const posted = input && typeof input === 'object' ? input : {};
  const billing = session.customer_details?.address || {};

  const address = {
    line1:       clean(posted.line1       || billing.line1),
    line2:       clean(posted.line2       || billing.line2) || undefined,
    city:        clean(posted.city        || billing.city),
    state:       clean(posted.state       || billing.state, 40),
    postal_code: clean(posted.postal_code || billing.postal_code, 20),
    // US-only, matching the shipping promise on the page and the
    // allowed_countries on the hosted fallback.
    country: 'US',
  };

  if (!address.line1 || !address.city || !address.state || !address.postal_code) return null;

  const name = clean(posted.name || session.customer_details?.name);
  if (!name) return null;

  return { name, address };
}
