// Learning entries list with a status dropdown per row and a delete action
import type { LearningEntry } from "./useLearningEntries";

const STATUS_TONE: Record<string, string> = {
  not_started: "text-neutral-500",
  in_progress: "text-yellow-400",
  done: "text-green-400",
};

type LearningEntryListProps = {
  entries: LearningEntry[];
  onStatusChange: (entry: LearningEntry, status: string) => void;
  onDelete: (id: number) => void;
};

export function LearningEntryList({ entries, onStatusChange, onDelete }: LearningEntryListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 last:border-b-0"
        >
          <div className="flex flex-col">
            <span className="text-sm text-neutral-200">{entry.topic.length > 50 ? entry.topic.substring(0, 50) + "..." : entry.topic}</span>
            <span className="text-xs capitalize text-neutral-500">{entry.track.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={entry.status}
              onChange={(event) => onStatusChange(entry, event.target.value)}
              className={`rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs ${STATUS_TONE[entry.status]}`}
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-red-950 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
