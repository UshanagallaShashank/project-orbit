import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

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
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Orchestrator</h2>
        <p className="text-slate-600 dark:text-slate-400">Run agents directly and inspect results in real-time</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Run an agent</h3>
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Agent</label>
              <select
                value={agentName}
                onChange={(e) => setAgentName(e.target.value as typeof AGENT_OPTIONS[number]['value'])}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                {AGENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Request</label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                rows={4}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Describe what you want Orbit to do..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isRunning || request.trim().length === 0}
                isLoading={isRunning}
              >
                {isRunning ? 'Running...' : 'Run Agent'}
              </Button>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Uses the backend orchestrator with guardrails enabled
              </p>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 flex gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </motion.div>
            )}
            {result && !error && (
              <motion.div
                className="mt-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4 flex gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Success</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1 whitespace-pre-wrap">{result}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent runs</h3>
        {runs.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <Zap className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No runs yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Submit a request above to see the orchestrator in action
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {runs.map((run, index) => (
                <motion.div
                  key={`${run.timestamp}-${run.request}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Badge variant="info" size="sm">
                          {run.agent_name.replace(/_/g, ' ')}
                        </Badge>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{run.request}</p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {run.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{run.result}</p>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
