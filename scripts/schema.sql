-- Run this in your Supabase SQL editor to set up the database.

-- ── Customers ────────────────────────────────────────────────────────────────
-- Created by the Stripe webhook when checkout.session.completed fires.
create table if not exists customers (
  id                    uuid default gen_random_uuid() primary key,
  stripe_session_id     text unique not null,
  stripe_customer_id    text,
  stripe_subscription_id text,
  service               text not null check (service in ('leads','websites','sales')),
  plan                  text,          -- 'monthly' | 'one-time' | 'installment' | 'license'
  email                 text,
  name                  text,
  phone                 text,
  business_name         text,
  amount_paid           integer,       -- cents
  currency              text default 'usd',
  status                text default 'pending' check (status in ('pending','onboarded','active','cancelled')),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── Onboarding submissions ────────────────────────────────────────────────────
create table if not exists onboarding (
  id           uuid default gen_random_uuid() primary key,
  customer_id  uuid references customers(id) on delete cascade,
  session_id   text not null,          -- stripe session_id, for lookup before customer row exists
  service      text not null,
  data         jsonb not null,
  submitted_at timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists customers_service_idx  on customers(service);
create index if not exists customers_status_idx   on customers(status);
create index if not exists onboarding_session_idx on onboarding(session_id);
create index if not exists onboarding_customer_idx on onboarding(customer_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_updated_at on customers;
create trigger customers_updated_at
  before update on customers
  for each row execute function update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- The API uses the service_role key (bypasses RLS), so no public access needed.
alter table customers  enable row level security;
alter table onboarding enable row level security;

-- No public policies — only service_role key can read/write.
