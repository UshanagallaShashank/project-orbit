-- Creates the expenses table used by ExpenseAgent for logging and rollups
create table if not exists expenses (
  id bigint generated always as identity primary key,
  amount numeric not null check (amount > 0),
  category text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- Single-user personal app: the backend talks to Supabase with the service role key, so RLS is off
alter table expenses disable row level security;
