// Learning entries list with a status dropdown per row and a delete action
import type { LearningEntry } from "./useLearningEntries";

const STATUS_TONE: Record<string, string> = {
  not_started: 'var(--color-text-tertiary)',
  in_progress: 'var(--color-warning)',
  done: 'var(--color-signal)',
};

type LearningEntryListProps = {
  entries: LearningEntry[];
  onStatusChange: (entry: LearningEntry, status: string) => void;
  onDelete: (id: number) => void;
};

export function LearningEntryList({ entries, onStatusChange, onDelete }: LearningEntryListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col">
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {entry.topic.length > 50 ? entry.topic.substring(0, 50) + '...' : entry.topic}
            </span>
            <span className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>
              {entry.track.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={entry.status}
              onChange={(event) => onStatusChange(entry, event.target.value)}
              className="rounded-lg border px-2 py-1 text-xs"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: STATUS_TONE[entry.status] }}
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg px-2 py-1 text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
