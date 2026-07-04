-- Tier 1: Cost, Eval, Idea agents

CREATE TABLE IF NOT EXISTS cost_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  cost_usd FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eval_runs (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  input_snapshot TEXT,
  output_snapshot TEXT,
  score INT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ideas (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  problem TEXT,
  priority INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cost_logs_agent ON cost_logs(agent_name);
CREATE INDEX idx_eval_runs_agent ON eval_runs(agent_name);
CREATE INDEX idx_ideas_priority ON ideas(priority);
