-- Creates the resume_versions table used by ResumeAgent for version tracking
create table if not exists resume_versions (
  id bigint generated always as identity primary key,
  label text not null,
  content text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table resume_versions disable row level security;
