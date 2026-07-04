// Money tab: expense log and monthly budget rollup
import { EmptyState } from "../EmptyState";

export function MoneyTab() {
  return (
    <EmptyState
      title="No expenses logged yet"
      hint="ExpenseAgent will track voice and manual expenses against your monthly budget here. Lands in phase 3."
    />
  );
}
