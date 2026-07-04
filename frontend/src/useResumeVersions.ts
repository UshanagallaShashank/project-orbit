// Hook that loads, searches, saves, and deletes resume versions
import { useCallback, useEffect, useState } from "react";

export type ResumeVersion = { id: number; label: string; content: string; note: string; created_at: string };

export function useResumeVersions() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);

  const reload = useCallback(() => {
    fetch("/resume/versions")
      .then((response) => (response.ok ? response.json() : []))
      .then(setVersions)
      .catch(() => setVersions([]));
  }, []);

  const search = useCallback((query: string) => {
    const params = new URLSearchParams({ q: query });
    fetch(`/resume/versions/search?${params}`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setVersions)
      .catch(() => setVersions([]));
  }, []);

  const remove = useCallback(
    async (id: number) => {
      await fetch(`/resume/versions/${id}`, { method: "DELETE" }).catch(() => null);
      reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { versions, reload, search, remove };
}
