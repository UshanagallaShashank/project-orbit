// Progress tab: log a topic, search/filter by track and status, and update progress
import { useCallback, useState } from "react";
import { EmptyState } from "../EmptyState";
import { LearningEntryForm } from "../LearningEntryForm";
import { LearningEntryList } from "../LearningEntryList";
import { SearchBar } from "../SearchBar";
import { useLearningEntries } from "../useLearningEntries";

const TRACKS = ["", "dsa", "core_ml", "modern_ai", "sysdesign"];
const STATUSES = ["", "not_started", "in_progress", "done"];

export function ProgressTab() {
  const { entries, reload, search, setStatus, remove } = useLearningEntries();
  const [track, setTrack] = useState("");
  const [status, setStatusFilter] = useState("");
  const onSearch = useCallback((query: string) => search(query, track, status), [search, track, status]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Log a topic</h2>
        <LearningEntryForm onSaved={reload} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Search progress</h2>
        <SearchBar placeholder="Search by topic..." onSearch={onSearch}>
          <select
            value={track}
            onChange={(event) => {
              setTrack(event.target.value);
              search("", event.target.value, status);
            }}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          >
            {TRACKS.map((name) => (
              <option key={name} value={name}>
                {name ? name.replace("_", " ") : "All tracks"}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              search("", track, event.target.value);
            }}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          >
            {STATUSES.map((name) => (
              <option key={name} value={name}>
                {name ? name.replace("_", " ") : "All statuses"}
              </option>
            ))}
          </select>
        </SearchBar>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Entries</h2>
        {entries.length === 0 ? (
          <EmptyState title="No study progress yet" hint="Log your first topic above to start tracking." />
        ) : (
          <LearningEntryList entries={entries} onStatusChange={setStatus} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
