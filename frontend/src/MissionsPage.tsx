// Review queue for FeatureAgent proposals - nothing here writes to the repo until Apply.
import { motion } from 'framer-motion';
import { Check, GitPullRequest, X } from 'lucide-react';
import { useState } from 'react';
import { useOrbit } from './OrbitApp';

export function MissionsPage() {
  const { pending } = useOrbit();
  const [busyId, setBusyId] = useState<number | null>(null);

  const resolve = async (id: number, action: 'apply' | 'reject') => {
    setBusyId(id);
    try {
      await fetch(`/features/proposals/${id}/${action}`, { method: 'POST' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Missions</h1>
      <p className="page-sub">
        Code changes FeatureAgent has drafted and SandboxAgent has tested. Nothing here writes to
        the repo until you click Apply.
      </p>

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="eicon">
            <GitPullRequest size={20} />
          </div>
          <h4>No pending missions</h4>
          <p>
            When you ask Orbit for a code change, the drafted diff and its test results land here
            for your review.
          </p>
        </div>
      ) : (
        pending.map((proposal, i) => (
          <motion.div
            key={proposal.id}
            className="proposal-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="top">
              <div>
                <div className="task">{proposal.task}</div>
                <div className="path">{proposal.file_path}</div>
              </div>
              <span className={`badge ${proposal.tests_passed ? 'ok' : 'crit'}`}>
                {proposal.tests_passed ? 'tests pass' : 'tests failed'}
              </span>
            </div>
            <pre className="diff-block">{proposal.diff}</pre>
            <div className="perm-actions">
              <button
                className="btn allow"
                onClick={() => void resolve(proposal.id, 'apply')}
                disabled={busyId === proposal.id || !proposal.tests_passed}
              >
                <Check size={13} />
                {busyId === proposal.id ? 'Applying...' : 'Apply'}
              </button>
              <button
                className="btn"
                onClick={() => void resolve(proposal.id, 'reject')}
                disabled={busyId === proposal.id}
              >
                <X size={13} />
                Reject
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
