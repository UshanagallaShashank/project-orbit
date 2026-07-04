-- Creates the memories table used by MemoryAgent for long-term context
create table if not exists memories (
  id bigint generated always as identity primary key,
  content text not null,
  tag text not null default 'general',
  created_at timestamptz not null default now()
);

alter table memories disable row level security;
