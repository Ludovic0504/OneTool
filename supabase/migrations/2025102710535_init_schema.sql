-- === Organisations & Profils liés à auth.users ===
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name text,
  created_at timestamptz not null default now()
);

-- === Entités CRM ===
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  domain text,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  title text not null,
  amount numeric,
  stage text not null check (stage in ('new','qualified','won','lost')) default 'new',
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  type text not null check (type in ('call','email','meeting','note')),
  content text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index utiles
create index if not exists companies_org_idx   on companies (organization_id);
create index if not exists contacts_org_idx    on contacts (organization_id);
create index if not exists contacts_company_idx on contacts (company_id);
create index if not exists deals_org_idx       on deals (organization_id);
create index if not exists activities_org_idx  on activities (organization_id);

-- === RLS (Row Level Security) ===
alter table if exists companies    enable row level security;
alter table if exists contacts     enable row level security;
alter table if exists deals        enable row level security;
alter table if exists activities   enable row level security;
alter table if exists profiles     enable row level security;
alter table if exists organizations enable row level security;

-- Helper : organisation du user connecté (via profiles)
create or replace function auth_org() returns uuid
language sql stable as $$
  select organization_id from public.profiles where user_id = auth.uid()
$$;

-- Policies

-- PROFILES
drop policy if exists profiles_select_self on profiles;
drop policy if exists profiles_upsert_self on profiles;
drop policy if exists profiles_update_self on profiles;

create policy profiles_select_self
  on profiles for select
  using (user_id = auth.uid());

create policy profiles_upsert_self
  on profiles for insert
  with check (user_id = auth.uid());

create policy profiles_update_self
  on profiles for update
  using (user_id = auth.uid());

-- ORGANIZATIONS
drop policy if exists organizations_read_own on organizations;
create policy organizations_read_own
  on organizations for select
  using (id = auth_org());

-- COMPANIES
drop policy if exists companies_crud_own_org on companies;
create policy companies_crud_own_org
  on companies for all
  using (organization_id = auth_org())
  with check (organization_id = auth_org());

-- CONTACTS
drop policy if exists contacts_crud_own_org on contacts;
create policy contacts_crud_own_org
  on contacts for all
  using (organization_id = auth_org())
  with check (organization_id = auth_org());

-- DEALS
drop policy if exists deals_crud_own_org on deals;
create policy deals_crud_own_org
  on deals for all
  using (organization_id = auth_org())
  with check (organization_id = auth_org());

-- ACTIVITIES
drop policy if exists activities_crud_own_org on activities;
create policy activities_crud_own_org
  on activities for all
  using (organization_id = auth_org())
  with check (organization_id = auth_org());

