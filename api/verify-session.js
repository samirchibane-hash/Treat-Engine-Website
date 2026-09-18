const Stripe = require('stripe');
const { STOCK: TABLET_STOCK, PRICE: TABLET_PRICE } = require('../lib/tablets');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // The subscription is expanded so /sales/welcome can quote the real trial end
    // and renewal amount off Stripe instead of hardcoding prices in the page.
    // Payment-mode sessions (websites) simply have no subscription — hence the
    // null guards below.
    // default_payment_method is expanded so /sales/welcome can name the card the
    // tablet add-on would charge ("the Visa ending 4242 you just used"). Naming
    // it is the whole basis for asking someone to buy with one click.
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'subscription.default_payment_method'],
    });

    // A trialing subscription completes with payment_status 'no_payment_required'
    // and amount_total 0 — the session is still complete and the subscription is
    // live, so onboarding must let it through.
    const settled =
      session.status === 'complete' ||
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required';

    if (!settled) {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const sub  = session.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null;
    const item = sub?.items?.data?.[0] || null;

    // ── Field tablet add-on ──
    // Ordered after checkout now, not in a modal before it, so the count lives
    // on the subscription (api/tablet-order.js writes it there). The session is
    // read as a fallback: the hosted-checkout path records it there via the
    // webhook, and it's also where any legacy pre-checkout order was written.
    const pm = sub?.default_payment_method;
    const card = pm && typeof pm === 'object' ? pm.card : null;
    const tablets =
      Number.parseInt(sub?.metadata?.tablets || session.metadata?.tablets || '0', 10) || 0;

    res.json({
      valid: true,
      service: session.metadata?.service,
      plan: session.metadata?.plan,
      userCount: session.metadata?.userCount,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      customerPhone: session.customer_details?.phone,
      amountTotal: session.amount_total,
      // ── ClearDeals plan detail (checkout-v2) ──
      tier: session.metadata?.tier,
      interval: session.metadata?.interval,
      trialDays: Number(session.metadata?.trial_days || 0),
      trialEnd: sub?.trial_end || null,
      renewsAt: sub?.current_period_end || null,
      recurringAmount: item?.price?.unit_amount ?? null,
      recurringInterval: item?.price?.recurring?.interval ?? null,
      // ── Field tablet add-on ──
      // Stock and price come from lib/tablets.js rather than being hardcoded in
      // the page, so the offer copy can never drift from what the server will
      // actually accept and charge.
      tablets,
      tabletStock: TABLET_STOCK,
      tabletPrice: TABLET_PRICE,
      cardBrand: card?.brand || null,
      cardLast4: card?.last4 || null,
      // Prefills the "ship to" line on the add-on — a no-tablet checkout never
      // collected a shipping address, only this one.
      billingAddress: session.customer_details?.address || null,
    });
  } catch (err) {
    console.error('Verify session error:', err.message);
    res.status(400).json({ error: 'Invalid session' });
  }
};
