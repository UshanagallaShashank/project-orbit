import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type RunEntry = {
  agent_name: string;
  request: string;
  result: string;
  timestamp: string;
};

const AGENT_OPTIONS = [
  { value: 'auto', label: 'Auto select' },
  { value: 'learning_tracker', label: 'Learning tracker' },
  { value: 'expense', label: 'Expense' },
  { value: 'resume', label: 'Resume' },
  { value: 'memory', label: 'Memory' },
] as const;

export function OrchestrationTab() {
  const [agentName, setAgentName] = useState<typeof AGENT_OPTIONS[number]['value']>('learning_tracker');
  const [request, setRequest] = useState('Log my study session on DSA for 45 minutes');
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_name: agentName, request }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || 'Agent run failed');
      }

      const nextRun: RunEntry = {
        agent_name: payload.agent_name || agentName,
        request,
        result: payload.result || 'No response returned',
        timestamp: new Date().toLocaleTimeString(),
      };

      setRuns((current) => [nextRun, ...current].slice(0, 6));
      setResult(nextRun.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Orchestrator</h2>
        <p className="text-gray-600">Run agents directly and inspect results in real-time</p>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Run an agent</h3>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
            <select
              value={agentName}
              onChange={(e) => setAgentName(e.target.value as typeof AGENT_OPTIONS[number]['value'])}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {AGENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="Describe what you want Orbit to do..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={isRunning || request.trim().length === 0} isLoading={isRunning}>
              {isRunning ? 'Running...' : 'Run Agent'}
            </Button>
            <p className="text-xs text-gray-600">Uses the backend orchestrator with guardrails enabled</p>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
        {result && !error && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-medium text-green-800">Success</p>
            <p className="text-sm text-green-700 mt-1 whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent runs</h3>
        {runs.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No runs yet</h3>
              <p className="text-gray-600">Submit a request above to see the orchestrator in action</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <Card key={`${run.timestamp}-${run.request}`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {run.agent_name.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm text-gray-700 mt-2">{run.request}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{run.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 font-mono">{run.result}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
