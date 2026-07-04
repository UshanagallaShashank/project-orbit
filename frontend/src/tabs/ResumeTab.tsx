// Resume tab: save a new version, search versions by label, and browse with staleness flags
import { EmptyState } from "../EmptyState";
import { ResumeVersionForm } from "../ResumeVersionForm";
import { ResumeVersionList } from "../ResumeVersionList";
import { SearchBar } from "../SearchBar";
import { useResumeVersions } from "../useResumeVersions";

export function ResumeTab() {
  const { versions, reload, search, remove } = useResumeVersions();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Save a new version</h2>
        <ResumeVersionForm onSaved={reload} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Search versions</h2>
        <SearchBar placeholder="Search by label..." onSearch={search} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Versions</h2>
        {versions.length === 0 ? (
          <EmptyState title="No resume versions yet" hint="Save your first version above to start tracking." />
        ) : (
          <ResumeVersionList versions={versions} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
