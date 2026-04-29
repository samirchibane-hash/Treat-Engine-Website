const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    res.json({
      valid: true,
      service: session.metadata?.service,
      plan: session.metadata?.plan,
      userCount: session.metadata?.userCount,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      customerPhone: session.customer_details?.phone,
      amountTotal: session.amount_total,
    });
  } catch (err) {
    console.error('Verify session error:', err.message);
    res.status(400).json({ error: 'Invalid session' });
  }
};
