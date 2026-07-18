// Full review queue for FeatureAgent proposals - the Missions section of the sidebar.
import { FeatureProposals } from './FeatureProposals';
import { useProposals } from './useProposals';

export function MissionsPage() {
  const { pending } = useProposals();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Missions
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Code changes FeatureAgent has drafted and SandboxAgent has tested. Nothing here writes to
          the repo until you click Apply.
        </p>
      </div>
      {pending.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          No pending missions right now.
        </p>
      ) : (
        <FeatureProposals />
      )}
    </div>
  );
}
