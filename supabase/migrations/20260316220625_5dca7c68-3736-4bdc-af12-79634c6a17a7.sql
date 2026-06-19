create table if not exists public.email_subscriptions (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  audience_type text,
  topics text[] default '{}',
  source text not null,
  article_slug text,
  created_at timestamptz default now(),
  confirmed_at timestamptz,
  is_active boolean default true
);

create index if not exists idx_email_subscriptions_email
  on public.email_subscriptions(email);

alter table public.email_subscriptions enable row level security;

create policy "Allow anon insert"
  on public.email_subscriptions for insert
  to anon with check (true);

create policy "Allow authenticated insert"
  on public.email_subscriptions for insert
  to authenticated with check (true);