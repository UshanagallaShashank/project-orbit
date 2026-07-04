-- Creates the expenses table used by ExpenseAgent for logging and rollups
create table if not exists expenses (
  id bigint generated always as identity primary key,
  amount numeric not null check (amount > 0),
  category text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
