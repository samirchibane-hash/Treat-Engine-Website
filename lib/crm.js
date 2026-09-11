const { createClient } = require('@supabase/supabase-js');

// The Treat Engine CRM (TECRM, reports.treatengine.com) is the only database
// this site writes to. The separate onboarding Supabase was retired in
// Sept 2026 — customers, onboarding answers and cancellations all live on the
// CRM's `clients` table now.
//
// Server-side only: CLIENT_MGMT_SUPABASE_KEY must be the CRM's *service role*
// key. The CRM's row-level security blocks the public anon key.
function crm() {
  return createClient(
    process.env.CLIENT_MGMT_SUPABASE_URL?.trim(),
    process.env.CLIENT_MGMT_SUPABASE_KEY?.trim(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function onboardingLink(service, sessionId) {
  const path = service === 'websites' ? 'websites' : service === 'sales' ? 'sales' : 'ads';
  return `https://treatengine.com/${path}/onboarding?session_id=${sessionId}`;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Maps the onboarding form (any service) onto the CRM's clients columns. Fields a
// form doesn't collect come through as undefined and are left untouched.
function onboardingFields(data, session) {
  const businessHours = {};
  DAYS.forEach(day => {
    businessHours[day] = {
      status: data[`hours_${day}_status`] || 'open',
      open: data[`hours_${day}_open`] || null,
      close: data[`hours_${day}_close`] || null,
    };
  });

  return {
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
  };
}

module.exports = { crm, onboardingLink, onboardingFields };
