// Resume tab: version history, diffs, and staleness flags
import { EmptyState } from "../EmptyState";

export function ResumeTab() {
  return (
    <EmptyState
      title="No resume versions yet"
      hint="ResumeAgent will track versions, show diffs, and flag stale sections here. Lands in phase 5."
    />
  );
}
