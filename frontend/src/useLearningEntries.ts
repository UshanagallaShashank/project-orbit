// Hook that loads, searches, saves, edits, and deletes learning entries
import { useCallback, useEffect, useState } from "react";

export type LearningEntry = {
  id: number;
  track: string;
  topic: string;
  status: string;
  note: string;
  created_at: string;
};

export function useLearningEntries() {
  const [entries, setEntries] = useState<LearningEntry[]>([]);

  const reload = useCallback(() => {
    fetch("/learning")
      .then((response) => (response.ok ? response.json() : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const search = useCallback((query: string, track: string, status: string) => {
    const params = new URLSearchParams({ q: query, track, status });
    fetch(`/learning/search?${params}`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const setStatus = useCallback(
    async (entry: LearningEntry, status: string) => {
      await fetch(`/learning/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, status }),
      }).catch(() => null);
      reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: number) => {
      await fetch(`/learning/${id}`, { method: "DELETE" }).catch(() => null);
      reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, reload, search, setStatus, remove };
}
