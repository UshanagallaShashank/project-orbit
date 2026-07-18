// Static metadata for every agent the orchestrator knows about, keyed by AgentName value
export type AgentKey =
  | 'learning_tracker'
  | 'expense'
  | 'resume'
  | 'memory'
  | 'cost'
  | 'eval'
  | 'idea'
  | 'leetcode'
  | 'project_tracker'
  | 'task'
  | 'comms'
  | 'qa'
  | 'feature'
  | 'sandbox';

interface AgentMeta {
  label: string;
  description: string;
  color: string;
  /** dev-loop = feature/sandbox/qa build-and-test chain; everyday = personal task agents */
  category: 'dev-loop' | 'everyday';
}

export const AGENT_REGISTRY: Record<AgentKey, AgentMeta> = {
  learning_tracker: { label: 'Learning Tracker', description: 'Logs study progress', color: 'bg-blue-500', category: 'everyday' },
  expense: { label: 'Expense', description: 'Logs expenses from free text', color: 'bg-green-500', category: 'everyday' },
  resume: { label: 'Resume', description: 'Saves resume versions', color: 'bg-purple-500', category: 'everyday' },
  memory: { label: 'Memory', description: 'Stores long-term notes', color: 'bg-amber-500', category: 'everyday' },
  cost: { label: 'Cost', description: 'Tracks LLM spend', color: 'bg-rose-500', category: 'everyday' },
  eval: { label: 'Eval', description: 'LLM-as-judge scoring', color: 'bg-cyan-500', category: 'everyday' },
  idea: { label: 'Idea', description: 'Brainstorms ideas', color: 'bg-fuchsia-500', category: 'everyday' },
  leetcode: { label: 'LeetCode', description: 'Tracks practice progress', color: 'bg-orange-500', category: 'everyday' },
  project_tracker: { label: 'Project Tracker', description: 'Flags stale repos', color: 'bg-indigo-500', category: 'everyday' },
  task: { label: 'Task', description: 'Daily task scheduling', color: 'bg-teal-500', category: 'everyday' },
  comms: { label: 'Comms', description: 'Drafts emails, never sends', color: 'bg-sky-500', category: 'everyday' },
  qa: { label: 'QA', description: 'Clicks through the frontend and reports pass/fail', color: 'bg-lime-500', category: 'dev-loop' },
  feature: { label: 'Feature', description: 'Drafts a code change, gated by Sandbox', color: 'bg-orange-500', category: 'dev-loop' },
  sandbox: { label: 'Sandbox', description: 'Runs pytest against a proposed change', color: 'bg-orange-500', category: 'dev-loop' },
};

export const AGENT_KEYS = Object.keys(AGENT_REGISTRY) as AgentKey[];
// Agents reachable through the LLM delegation loop (excludes feature/sandbox/qa, which have
// their own review-gated lifecycle rather than being general-purpose callable tools).
export const DELEGATABLE_AGENT_KEYS = AGENT_KEYS.filter((k) => AGENT_REGISTRY[k].category === 'everyday');
