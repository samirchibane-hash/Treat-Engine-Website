const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

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
  const supabase = createClient(
    process.env.SUPABASE_URL?.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );

  try {
    // Verify payment is complete
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Payment not verified' });
    }

    // Find the customer row (created by webhook, or create it now if webhook was slow)
    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_session_id', session_id)
      .single();

    if (!customer) {
      const { data: created } = await supabase
        .from('customers')
        .upsert({
          stripe_session_id: session_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription || null,
          service,
          plan: session.metadata?.plan,
          email: session.customer_details?.email,
          name: session.customer_details?.name,
          phone: session.customer_details?.phone,
          amount_paid: session.amount_total,
          status: 'pending',
        }, { onConflict: 'stripe_session_id' })
        .select('id')
        .single();
      customer = created;
    }

    // Upsert onboarding data (idempotent — safe to resubmit)
    const { error: obError } = await supabase
      .from('onboarding')
      .upsert({
        customer_id: customer?.id,
        session_id,
        service,
        data,
      }, { onConflict: 'session_id' });

    if (obError) throw obError;

    // Mark customer as onboarded
    if (customer?.id) {
      const updateData = { status: 'onboarded' };
      if (data.businessName) updateData.business_name = data.businessName;
      await supabase.from('customers').update(updateData).eq('id', customer.id);
    }

    res.json({ success: true });

    // Sync to Client Management project (non-blocking — don't fail the response)
    syncToClientManagement({ session_id, service, plan: session.metadata?.plan, session, data })
      .catch(err => console.error('Client Management sync error:', err.message));

  } catch (err) {
    console.error('Onboarding error:', err.message);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
};

async function syncToClientManagement({ session_id, service, plan, session, data }) {
  const { createClient } = require('@supabase/supabase-js');
  const clientMgmt = createClient(
    process.env.CLIENT_MGMT_SUPABASE_URL,
    process.env.CLIENT_MGMT_SUPABASE_KEY
  );

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const businessHours = {};
  DAYS.forEach(day => {
    businessHours[day] = {
      status: data[`hours_${day}_status`] || 'open',
      open: data[`hours_${day}_open`] || null,
      close: data[`hours_${day}_close`] || null,
    };
  });

  const onboardingPath = service === 'websites' ? 'websites' : service === 'sales' ? 'sales' : 'ads';
  const { error } = await clientMgmt.from('clients').upsert({
    session_id,
    service,
    plan,
    onboarding_link: `https://treatengine.com/${onboardingPath}/onboarding?session_id=${session_id}`,
    // Contact
    full_name: data.fullName || session.customer_details?.name,
    email: data.email || session.customer_details?.email,
    phone: data.phone || session.customer_details?.phone,
    // Business
    business_name: data.businessName,
    city: data.city,
    state: data.state,
    service_area: data.serviceArea || null,
    website_url: data.websiteUrl || null,
    brands: data.brands ? [].concat(data.brands) : [],
    // Campaign
    has_facebook: data.hasFacebook === 'yes',
    facebook_url: data.facebookUrl || null,
    ad_budget: data.adBudget,
    offers: data.offers ? [].concat(data.offers) : [],
    additional_notes: data.additionalNotes || null,
    // Hours
    business_hours: businessHours,
    // Registration
    owner_name: data.ownerName,
    owner_email: data.ownerEmail,
    owner_cell: data.ownerCell,
    legal_business_name: data.legalBusinessName,
    business_email: data.businessEmail,
    business_phone: data.businessPhone,
    business_type: data.businessType,
    ein: data.ein,
    // Payment
    amount_paid: session.amount_total,
    currency: session.currency,
  }, { onConflict: 'session_id' });

  if (error) throw error;
}
