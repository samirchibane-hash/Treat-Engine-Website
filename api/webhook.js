const Stripe = require('stripe');
const { crm, onboardingLink } = require('../lib/crm');

const getRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const db = crm();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { service, plan } = session.metadata || {};

    // New customers appear in the CRM at checkout, before onboarding. Insert-only:
    // if the customer already finished onboarding (webhook was slow), their row
    // and 'onboarded' status must not be overwritten with checkout defaults.
    const { error: insertError } = await db.from('clients').upsert({
      session_id: session.id,
      service,
      plan,
      full_name: session.customer_details?.name,
      email: session.customer_details?.email,
      phone: session.customer_details?.phone,
      amount_paid: session.amount_total,
      currency: session.currency,
      status: 'pending',
      onboarding_link: onboardingLink(service, session.id),
    }, { onConflict: 'session_id', ignoreDuplicates: true });
    if (insertError) console.error('CRM checkout insert error:', insertError.message);

    // Stripe IDs are always safe to (re)write — cancellations are matched on them.
    const { error: idsError } = await db.from('clients').update({
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription || null,
    }).eq('session_id', session.id);
    if (idsError) console.error('CRM Stripe ID update error:', idsError.message);

    // For Water Websites CRM: auto-start $199/mo subscription with 30-day trial
    if (service === 'websites' && plan === 'websites-crm' && session.customer) {
      try {
        const subscription = await stripe.subscriptions.create({
          customer: session.customer,
          items: [{ price: process.env.STRIPE_PRICE_WEBSITES_MONTHLY }],
          trial_period_days: 30,
        });
        // The checkout itself was a one-time payment, so this is the subscription
        // a later cancellation will reference.
        await db.from('clients')
          .update({ stripe_subscription_id: subscription.id })
          .eq('session_id', session.id);
      } catch (err) {
        console.error('Subscription creation error:', err.message);
      }
    }

    // For Water Websites installment: auto-cancel subscription after 2 billing cycles
    if (service === 'websites' && plan === 'installment' && session.subscription) {
      try {
        const schedule = await stripe.subscriptionSchedules.create({
          from_subscription: session.subscription,
        });
        await stripe.subscriptionSchedules.update(schedule.id, {
          end_behavior: 'cancel',
          phases: [{
            start_date: schedule.phases[0].start_date,
            iterations: 2,
            items: [{ price: process.env.STRIPE_PRICE_WEBSITES_INSTALLMENT, quantity: 1 }],
          }],
        });
      } catch (err) {
        console.error('Billing schedule error:', err.message);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    const { data: client, error: lookupError } = await db
      .from('clients')
      .select('id, plan')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle();

    if (lookupError) {
      console.error('CRM cancellation lookup error:', lookupError.message);
    } else if (!client) {
      console.warn('Subscription deleted with no matching CRM client:', sub.id);
    } else if (client.plan === 'installment') {
      // Installment plans end on purpose after their last payment — that's
      // paid in full, not churn.
    } else {
      const { error } = await db.from('clients')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', client.id);
      if (error) console.error('CRM cancellation update error:', error.message);
    }
  }

  res.json({ received: true });
};
