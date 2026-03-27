-- ================================================================
-- VELA — Supabase Schema
-- Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır
-- ================================================================

-- ── Profiles (auto-created on signup via trigger) ─────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  currency    text not null default 'TRY',
  created_at  timestamptz not null default now()
);

-- ── Contacts ──────────────────────────────────────────────────
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── Debts / Receivables ───────────────────────────────────────
create table if not exists public.debts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  contact_id   uuid references public.contacts(id) on delete set null,
  type         text not null check (type in ('debt', 'credit')),
  amount       numeric(12, 2) not null,
  paid_amount  numeric(12, 2) not null default 0,
  due_date     date,
  description  text,
  receipt_url  text,
  status       text not null default 'open' check (status in ('open', 'partial', 'paid')),
  created_at   timestamptz not null default now()
);

-- ── Assets / Portfolio ────────────────────────────────────────
create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('gold','usd','eur','gbp','btc','eth','stock','fund','commodity','custom')),
  symbol      text not null,
  name        text not null,
  quantity    numeric(18, 8) not null,
  buy_price   numeric(12, 2) not null,
  bought_at   date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);

-- ── Transactions (Budget) ─────────────────────────────────────
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('income', 'expense')),
  amount       numeric(12, 2) not null,
  category     text not null default 'genel',
  description  text,
  date         date not null default current_date,
  receipt_url  text,
  created_at   timestamptz not null default now()
);

-- ── Budget Limits ─────────────────────────────────────────────
create table if not exists public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  category      text not null,
  limit_amount  numeric(12, 2) not null,
  month         text not null, -- format: '2026-03'
  unique (user_id, category, month)
);

-- ================================================================
-- ROW LEVEL SECURITY — Her kullanıcı sadece kendi verisini görür
-- ================================================================

alter table public.profiles     enable row level security;
alter table public.contacts     enable row level security;
alter table public.debts        enable row level security;
alter table public.assets       enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

-- Profiles
create policy "profiles: own read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Contacts
create policy "contacts: own all" on public.contacts for all using (auth.uid() = user_id);

-- Debts
create policy "debts: own all" on public.debts for all using (auth.uid() = user_id);

-- Assets
create policy "assets: own all" on public.assets for all using (auth.uid() = user_id);

-- Transactions
create policy "transactions: own all" on public.transactions for all using (auth.uid() = user_id);

-- Budgets
create policy "budgets: own all" on public.budgets for all using (auth.uid() = user_id);

-- ================================================================
-- TRIGGER — Yeni kullanıcı kaydında otomatik profil oluştur
-- ================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- INDEXES — Performans için
-- ================================================================

create index if not exists idx_contacts_user     on public.contacts(user_id);
create index if not exists idx_debts_user        on public.debts(user_id);
create index if not exists idx_debts_contact     on public.debts(contact_id);
create index if not exists idx_debts_status      on public.debts(status);
create index if not exists idx_assets_user       on public.assets(user_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_budgets_user      on public.budgets(user_id, month);
