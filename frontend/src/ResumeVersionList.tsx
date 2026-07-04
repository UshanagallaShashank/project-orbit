// Resume versions list, newest first, with staleness flag and a delete action
import type { ResumeVersion } from "./useResumeVersions";

const STALE_DAYS = 30;

type ResumeVersionListProps = { versions: ResumeVersion[]; onDelete: (id: number) => void };

export function ResumeVersionList({ versions, onDelete }: ResumeVersionListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      {versions.map((version) => {
        const ageDays = (Date.now() - new Date(version.created_at).getTime()) / 86400000;
        const isStale = ageDays > STALE_DAYS;
        return (
          <div
            key={version.id}
            className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="text-sm text-neutral-200">{version.label}</span>
              <span className="text-xs text-neutral-500">
                {new Date(version.created_at).toLocaleDateString("en-IN")}
                {isStale && <span className="ml-2 text-yellow-500">Stale - {Math.floor(ageDays)}d old</span>}
              </span>
            </div>
            <button
              onClick={() => onDelete(version.id)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-red-950 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
