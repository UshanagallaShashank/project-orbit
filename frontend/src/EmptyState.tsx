// Reusable placeholder card shown when a tab has no data yet
type EmptyStateProps = { title: string; hint: string };

export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 px-6 py-20 text-center">
      <p className="text-base font-medium text-neutral-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{hint}</p>
    </div>
  );
}
