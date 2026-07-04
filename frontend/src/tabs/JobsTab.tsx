// Jobs tab: matched postings queued for one-click approval
import { EmptyState } from "../EmptyState";

export function JobsTab() {
  return (
    <EmptyState
      title="No job matches yet"
      hint="JobAgent will queue tailored applications here for your approval - it never auto-submits. Lands in phase 11."
    />
  );
}
