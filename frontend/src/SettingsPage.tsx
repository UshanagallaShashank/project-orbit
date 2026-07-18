// Local session preferences - theme is the one thing configurable today, so it gets a
// proper two-option card instead of stub controls for backend config with no UI toggle.
import { Moon, Sun } from 'lucide-react';
import { useOrbit } from './OrbitApp';

export function SettingsPage() {
  const { theme, setTheme } = useOrbit();

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Local session preferences.</p>

      <div className="settings-card">
        <div className="t">Theme</div>
        <div className="d">
          Dark is the mission-deck default. Your choice is remembered on this device.
        </div>
        <div className="theme-options">
          <button
            className={`theme-option${theme === 'dark' ? ' on' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            className={`theme-option${theme === 'light' ? ' on' : ''}`}
            onClick={() => setTheme('light')}
          >
            <Sun size={16} />
            Light
          </button>
        </div>
      </div>
    </div>
  );
}
