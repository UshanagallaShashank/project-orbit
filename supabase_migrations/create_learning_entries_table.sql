-- Creates the learning_entries table used by LearningTracker for study progress
create table if not exists learning_entries (
  id bigint generated always as identity primary key,
  track text not null,
  topic text not null,
  status text not null default 'not_started',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table learning_entries disable row level security;
