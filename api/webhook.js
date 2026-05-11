const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

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
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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
    const { service, plan, userCount } = session.metadata || {};

    const customerRow = {
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription || null,
      service,
      plan,
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: session.customer_details?.phone,
      amount_paid: session.amount_total,
      currency: session.currency,
      status: 'pending',
    };

    const { error } = await supabase
      .from('customers')
      .upsert(customerRow, { onConflict: 'stripe_session_id' });

    if (error) console.error('Supabase upsert error:', error.message);

    // For Water Websites CRM: auto-start $199/mo subscription with 30-day trial
    if (service === 'websites' && plan === 'websites-crm' && session.customer) {
      try {
        await stripe.subscriptions.create({
          customer: session.customer,
          items: [{ price: process.env.STRIPE_PRICE_WEBSITES_MONTHLY }],
          trial_period_days: 30,
        });
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
    await supabase
      .from('customers')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id);
  }

  res.json({ received: true });
};
