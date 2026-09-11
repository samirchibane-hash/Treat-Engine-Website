const Stripe = require('stripe');
const { crm, onboardingLink, onboardingFields } = require('../lib/crm');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id, service, data } = req.body || {};
  if (!session_id || !service || !data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Verify payment is complete
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Payment not verified' });
    }

    // One upsert on the CRM's clients row (created at checkout by the webhook,
    // or created here if the webhook was slow). Idempotent — safe to resubmit.
    // This is the only copy of the customer's answers, so a failure is returned
    // to the form instead of being logged and swallowed.
    const plan = session.metadata?.plan;
    const { error } = await crm().from('clients').upsert({
      session_id,
      service,
      plan,
      onboarding_link: onboardingLink(service, session_id),
      stripe_customer_id: session.customer,
      amount_paid: session.amount_total,
      currency: session.currency,
      ...onboardingFields(data, session),
      onboarding_data: data,
      status: 'onboarded',
      onboarded_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err.message);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
};
