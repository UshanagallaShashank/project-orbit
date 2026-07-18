// Shows the oldest pending FeatureAgent proposal as a permission request - apply/reject are
// the only two paths that ever touch a pending proposal; nothing writes to the repo otherwise.
import { AlertTriangle, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useProposals } from './useProposals';

export function PermissionPanel() {
  const { pending } = useProposals();
  const [busyId, setBusyId] = useState<number | null>(null);
  const next = pending[0];

  const resolve = async (id: number, action: 'apply' | 'reject') => {
    setBusyId(id);
    try {
      await fetch(`/features/proposals/${id}/${action}`, { method: 'POST' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4"
      style={{ borderColor: next ? 'var(--color-warning)' : 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      {next && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, var(--color-warning-soft), transparent 60%)' }}
        />
      )}
      <div className="relative z-10 mb-2.5 flex items-center gap-2">
        <AlertTriangle size={15} color={next ? 'var(--color-warning)' : 'var(--color-text-tertiary)'} />
        <h3 className="font-display text-[13px] font-semibold" style={{ color: next ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>
          {next ? 'Awaiting permission' : 'No pending permissions'}
        </h3>
      </div>

      {next ? (
        <div className="relative z-10 text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            feature
          </span>{' '}
          wants to write{' '}
          <span className="rounded px-1.5 py-0.5 font-mono" style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}>
            {next.file_path}
          </span>{' '}
          — {next.tests_passed ? 'tests passed' : 'tests failed'}.
          <div className="mt-2.5 flex gap-1.5">
            <button
              onClick={() => void resolve(next.id, 'apply')}
              disabled={busyId === next.id || !next.tests_passed}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--color-warning)', color: 'var(--color-void, #08090d)' }}
            >
              <Check size={13} />
              {busyId === next.id ? 'Applying…' : 'Allow & apply'}
            </button>
            <button
              onClick={() => void resolve(next.id, 'reject')}
              disabled={busyId === next.id}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-surface-raised)' }}
            >
              <X size={13} />
              Deny
            </button>
          </div>
        </div>
      ) : (
        <p className="relative z-10 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          Nothing writes to the repo automatically — you'll see a card here the moment an agent proposes a change.
        </p>
      )}
    </div>
  );
}
