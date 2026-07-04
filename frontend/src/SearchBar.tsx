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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-800 p-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-48 grow rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />
      {children}
    </div>
  );
}
