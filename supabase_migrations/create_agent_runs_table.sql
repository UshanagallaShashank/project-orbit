-- Creates the agent_runs and agent_tool_calls tables that persist every orchestrator run
-- so the dashboard can show live/historical agent activity, cost, and tool usage
create table if not exists agent_runs (
  id bigint generated always as identity primary key,
  conversation_id text not null,
  agent_name text not null,
  request text not null,
  status text not null default 'running',
  result text,
  tokens_prompt integer,
  tokens_completion integer,
  tokens_total integer,
  cost_usd numeric,
  cost_inr numeric,
  model text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table agent_runs disable row level security;

create table if not exists agent_tool_calls (
  id bigint generated always as identity primary key,
  run_id bigint not null references agent_runs (id) on delete cascade,
  tool_name text not null,
  input text,
  output text,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table agent_tool_calls disable row level security;

create index if not exists agent_runs_started_at_idx on agent_runs (started_at desc);
create index if not exists agent_tool_calls_run_id_idx on agent_tool_calls (run_id);
