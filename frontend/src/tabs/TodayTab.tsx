// Today tab: priority-ranked list of what matters right now
import { EmptyState } from "../EmptyState";

export function TodayTab() {
  return (
    <EmptyState
      title="Nothing scheduled yet"
      hint="TaskAgent will rank your day here: overdue first, then time-sensitive, then routine. Lands in phase 7."
    />
  );
}
