// Orchestration tab: run any agent directly and inspect the latest results
import { useState } from "react";
import { EmptyState } from "../EmptyState";

type RunEntry = {
  agent_name: string;
  request: string;
  result: string;
  timestamp: string;
};

const AGENT_OPTIONS = [
  { value: "auto", label: "Auto select" },
  { value: "learning_tracker", label: "Learning tracker" },
  { value: "expense", label: "Expense" },
  { value: "resume", label: "Resume" },
  { value: "memory", label: "Memory" },
] as const;

export function OrchestrationTab() {
  const [agentName, setAgentName] = useState<(typeof AGENT_OPTIONS)[number]["value"]>("learning_tracker");
  const [request, setRequest] = useState("Log my study session on DSA for 45 minutes");
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch("/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName, request }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || "Agent run failed");
      }

      const nextRun: RunEntry = {
        agent_name: payload.agent_name || agentName,
        request,
        result: payload.result || "No response returned",
        timestamp: new Date().toLocaleTimeString(),
      };

      setRuns((current) => [nextRun, ...current].slice(0, 6));
      setResult(nextRun.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-200">Run an agent</h2>
            <p className="mt-1 text-sm text-neutral-500">Send a plain-language request to any of Orbit’s agents.</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            Agent
            <select
              value={agentName}
              onChange={(event) => setAgentName(event.target.value as (typeof AGENT_OPTIONS)[number]["value"])}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
            >
              {AGENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            Request
            <textarea
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              rows={4}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
              placeholder="Describe what you want Orbit to do"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isRunning || request.trim().length === 0}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
            >
              {isRunning ? "Running…" : "Run agent"}
            </button>
            <span className="text-sm text-neutral-500">Uses the backend orchestrator and guardrails.</span>
          </div>
        </form>

        {error && <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        {result && !error && (
          <div className="mt-4 rounded-md border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
            {result}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Recent runs</h2>
        {runs.length === 0 ? (
          <EmptyState
            title="No agent runs yet"
            hint="Submit a request above to see the orchestrator output and recent activity here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map((run) => (
              <div key={`${run.timestamp}-${run.request}`} className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium capitalize text-neutral-200">{run.agent_name.replace(/_/g, " ")}</span>
                  <span className="text-xs text-neutral-500">{run.timestamp}</span>
                </div>
                <p className="mb-2 text-sm text-neutral-400">{run.request}</p>
                <p className="text-sm text-neutral-200">{run.result}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
