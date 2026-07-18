// Minimal settings page - surfaces what's actually configurable today (theme) rather than
// stubbing controls for backend config that has no UI-facing toggle yet.
import { useEffect, useState } from 'react';

export function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null) ?? 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Settings
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Local session preferences.
        </p>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="text-[13px] font-medium">Theme</div>
        <div className="mt-2 flex gap-2">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="rounded-lg border px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors"
              style={{
                borderColor: theme === t ? 'var(--color-signal)' : 'var(--color-border)',
                color: theme === t ? 'var(--color-signal)' : 'var(--color-text-secondary)',
                background: theme === t ? 'var(--color-signal-soft)' : 'var(--color-surface-raised)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
