// Polls pending FeatureAgent proposals - shared by the sidebar's Missions badge and the
// Missions page itself so the count is never a guess.
import { useEffect, useState } from 'react';

export interface Proposal {
  id: number;
  task: string;
  file_path: string;
  diff: string;
  test_output: string;
  tests_passed: boolean;
  status: string;
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const load = () =>
      fetch('/features/proposals')
        .then((res) => (res.ok ? res.json() : []))
        .then(setProposals)
        .catch(() => {});
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const pending = proposals.filter((p) => p.status === 'pending');
  return { proposals, pending };
}
