// Lists pending code-change proposals from FeatureAgent; apply/reject requires explicit click
import { useState } from 'react';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { useProposals } from './useProposals';

export function FeatureProposals() {
  const { pending } = useProposals();
  const [busyId, setBusyId] = useState<number | null>(null);

  const resolve = async (id: number, action: 'apply' | 'reject') => {
    setBusyId(id);
    try {
      await fetch(`/features/proposals/${id}/${action}`, { method: 'POST' });
    } finally {
      setBusyId(null);
    }
  };

  if (pending.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Pending code proposals
      </h3>
      {pending.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{p.task}</p>
              <p className="mt-1 text-xs text-slate-500 truncate">{p.file_path}</p>
            </div>
            <Badge variant={p.tests_passed ? 'success' : 'danger'} size="sm">
              {p.tests_passed ? 'tests pass' : 'tests failed'}
            </Badge>
          </div>
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-950 p-3 text-xs">
            {p.diff}
          </pre>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => void resolve(p.id, 'apply')}
              isLoading={busyId === p.id}
              disabled={!p.tests_passed}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void resolve(p.id, 'reject')}
              isLoading={busyId === p.id}
            >
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
