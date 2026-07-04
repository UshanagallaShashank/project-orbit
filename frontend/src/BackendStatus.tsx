// Status pill that checks the backend health endpoint every thirty seconds
import { useEffect, useState } from "react";

export function BackendStatus() {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    const check = () =>
      fetch("/health")
        .then((response) => setOnline(response.ok))
        .catch(() => setOnline(false));
    void check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-300">
      <span className={online ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-red-500"} />
      {online ? "Backend online" : "Backend offline"}
    </span>
  );
}
