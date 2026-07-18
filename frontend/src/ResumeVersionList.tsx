// Resume versions list, newest first, with staleness flag and a delete action
import type { ResumeVersion } from "./useResumeVersions";

const STALE_DAYS = 30;

type ResumeVersionListProps = { versions: ResumeVersion[]; onDelete: (id: number) => void };

export function ResumeVersionList({ versions, onDelete }: ResumeVersionListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      {versions.map((version) => {
        const ageDays = (Date.now() - new Date(version.created_at).getTime()) / 86400000;
        const isStale = ageDays > STALE_DAYS;
        return (
          <div
            key={version.id}
            className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {version.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {new Date(version.created_at).toLocaleDateString('en-IN')}
                {isStale && (
                  <span className="ml-2" style={{ color: 'var(--color-warning)' }}>
                    Stale - {Math.floor(ageDays)}d old
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => onDelete(version.id)}
              className="rounded-lg px-2 py-1 text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
