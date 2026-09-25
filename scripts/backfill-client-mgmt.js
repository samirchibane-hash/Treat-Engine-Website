require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const dest = createClient(
  process.env.CLIENT_MGMT_SUPABASE_URL.trim(),
  process.env.CLIENT_MGMT_SUPABASE_KEY.trim()
);

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function buildPayload(customer, data) {
  const businessHours = {};
  DAYS.forEach(day => {
    businessHours[day] = {
      status: data[`hours_${day}_status`] || 'open',
      open: data[`hours_${day}_open`] || null,
      close: data[`hours_${day}_close`] || null,
    };
  });

  return {
    session_id: customer.stripe_session_id,
    service: customer.service,
    plan: customer.plan,
    full_name: data.fullName || customer.name,
    email: data.email || customer.email,
    phone: data.phone || customer.phone,
    business_name: data.businessName || customer.business_name,
    city: data.city,
    state: data.state,
    service_area: data.serviceArea || null,
    website_url: data.websiteUrl || null,
    brands: data.brands ? [].concat(data.brands) : [],
    has_facebook: data.hasFacebook === 'yes',
    facebook_url: data.facebookUrl || null,
    ad_budget: data.adBudget,
    offers: data.offers ? [].concat(data.offers) : [],
    additional_notes: data.additionalNotes || null,
    business_hours: businessHours,
    owner_name: data.ownerName,
    owner_email: data.ownerEmail,
    owner_cell: data.ownerCell,
    legal_business_name: data.legalBusinessName,
    business_email: data.businessEmail,
    business_phone: data.businessPhone,
    business_type: data.businessType,
    ein: data.ein,
    amount_paid: customer.amount_paid,
    currency: customer.currency,
    status: customer.status,
  };
}

// Customers fetched from Treat Engine Supabase
const customers = [
  {
    stripe_session_id: "cs_live_b1aDaBEW6bZkNYgSNet052JaWMsULrE37kKChTo2ZPqSvCS67vZsMuqd7O",
    service: "leads", plan: "ala-carte", name: "Robert Ross",
    email: "michael@hqwaa.com", phone: null, business_name: "High Quality Water and Air",
    amount_paid: 79800, currency: "usd", status: "onboarded",
    data: {"ein":"86-0947765","city":"Tempe","email":"michael@hqwaa.com","phone":"4803291701","state":"Arizona","brands":"RainSoft","offers":["FREE Installation For Whole Home Systems","Get a FREE Under Sink RO With Whole-Home Systems","Zero Payments for 90 Days"],"adBudget":"$3,500+","fullName":"Robert Ross","ownerCell":"4803291701","ownerName":"Michael Ross","ownerEmail":"Michael@hqwaa.com","websiteUrl":"https://hqwaa.com","facebookUrl":"","hasFacebook":"no","serviceArea":"Tucson, San Diego, Oklahoma City and Tulsa","businessName":"High Quality Water and Air","businessType":"C Corp","businessEmail":"Info@hqwaa.com","businessPhone":"4809403434","additionalNotes":"","hours_Friday_open":"10:00 AM","hours_Monday_open":"10:00 AM","hours_Sunday_open":"8:00 AM","legalBusinessName":"High Quality Water of AZ INC","hours_Friday_close":"8:00 PM","hours_Monday_close":"8:00 PM","hours_Sunday_close":"6:00 PM","hours_Tuesday_open":"10:00 AM","hours_Friday_status":"open","hours_Monday_status":"open","hours_Saturday_open":"10:00 AM","hours_Sunday_status":"closed","hours_Thursday_open":"10:00 AM","hours_Tuesday_close":"8:00 PM","hours_Saturday_close":"3:00 PM","hours_Thursday_close":"8:00 PM","hours_Tuesday_status":"open","hours_Wednesday_open":"10:00 AM","hours_Saturday_status":"open","hours_Thursday_status":"open","hours_Wednesday_close":"8:00 PM","hours_Wednesday_status":"open"},
  },
];

async function run() {
  console.log(`Syncing ${customers.length} customer(s) to Client Management…`);
  for (const c of customers) {
    const payload = buildPayload(c, c.data);
    const { error } = await dest.from('clients').upsert(payload, { onConflict: 'session_id' });
    if (error) {
      console.error(`  ✗ ${c.name} — ${error.message}`);
    } else {
      console.log(`  ✓ ${c.name} (${c.business_name})`);
    }
  }
  console.log('Done.');
}

run();
