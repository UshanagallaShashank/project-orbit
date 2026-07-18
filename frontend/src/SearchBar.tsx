// Reusable search input with optional filter slots, debounced before firing onSearch
import { useEffect, useState } from "react";

type SearchBarProps = { placeholder: string; onSearch: (query: string) => void; children?: React.ReactNode };

export function SearchBar({ placeholder, onSearch, children }: SearchBarProps) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-48 grow rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' }}
      />
      {children}
    </div>
  );
}
