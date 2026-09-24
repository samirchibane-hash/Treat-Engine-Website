const { postLead, parseLead } = require('../lib/leads');

// Step 1 of /sales-v2/start. Captures the dealer the moment they give us their
// contact details, so a drop-off on the brands step can still be followed up.
// The same lead is sent again as checkout_started once they reach Stripe.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const lead = parseLead(req.body && req.body.lead);
  if (!lead) return res.status(400).json({ error: 'Missing lead' });
  if (lead.error) return res.status(400).json({ error: lead.error });

  await postLead('lead_captured', {
    ...lead,
    first_name: lead.name.split(/\s+/)[0],
    brands: '',
    plan: String((req.body && req.body.plan) || '').slice(0, 20),
    interval: String((req.body && req.body.interval) || '').slice(0, 10),
  });
  res.json({ ok: true });
};
