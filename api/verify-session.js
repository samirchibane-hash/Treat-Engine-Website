const Stripe = require('stripe');

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
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
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
    });
  } catch (err) {
    console.error('Verify session error:', err.message);
    res.status(400).json({ error: 'Invalid session' });
  }
};
