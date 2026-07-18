// Shows the oldest pending FeatureAgent proposal as a permission request - apply/reject are
// the only two paths that ever touch a pending proposal; nothing writes to the repo otherwise.
import { AlertTriangle, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useOrbit } from './OrbitApp';

export function PermissionPanel() {
  const { pending } = useOrbit();
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
    <div className={`perm-panel${next ? ' alert' : ''}`}>
      <div className="ph">
        <AlertTriangle size={15} />
        <h3>{next ? 'Awaiting permission' : 'No pending permissions'}</h3>
      </div>

      {next ? (
        <div className="perm-row">
          <span className="who">feature</span> wants to write <span className="target">{next.file_path}</span>{' '}
          - {next.tests_passed ? 'tests passed' : 'tests failed'}.
          <div className="perm-actions">
            <button
              className="btn allow grow"
              onClick={() => void resolve(next.id, 'apply')}
              disabled={busyId === next.id || !next.tests_passed}
            >
              <Check size={13} />
              {busyId === next.id ? 'Applying...' : 'Allow and apply'}
            </button>
            <button
              className="btn grow"
              onClick={() => void resolve(next.id, 'reject')}
              disabled={busyId === next.id}
            >
              <X size={13} />
              Deny
            </button>
          </div>
        </div>
      ) : (
        <p className="perm-row" style={{ margin: 0, color: 'var(--ink-faint)' }}>
          Nothing writes to the repo automatically - you will see a card here the moment an agent
          proposes a change.
        </p>
      )}
    </div>
  );
}
