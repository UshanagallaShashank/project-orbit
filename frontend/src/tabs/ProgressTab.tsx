import { useCallback, useState } from 'react';
import { LearningEntryForm } from '../LearningEntryForm';
import { LearningEntryList } from '../LearningEntryList';
import { SearchBar } from '../SearchBar';
import { useLearningEntries } from '../useLearningEntries';
import { Card } from '../components/Card';

const TRACKS = ['', 'dsa', 'core_ml', 'modern_ai', 'sysdesign'];
const STATUSES = ['', 'not_started', 'in_progress', 'done'];

export function ProgressTab() {
  const { entries, reload, search, setStatus, remove } = useLearningEntries();
  const [track, setTrack] = useState('');
  const [status, setStatusFilter] = useState('');
  const onSearch = useCallback(
    (query: string) => search(query, track, status),
    [search, track, status],
  );

  const stats = {
    total: entries.length,
    done: entries.filter((e) => e.status === 'done').length,
    inProgress: entries.filter((e) => e.status === 'in_progress').length,
  };

  const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Progress</h2>
        <p className="text-gray-600">Track your progress across learning tracks</p>
      </div>

      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{progressPercent}%</div>
              <p className="text-xs text-gray-600 mt-1">Overall Progress</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.done}</div>
              <p className="text-xs text-gray-600 mt-1">Completed</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-gray-600 mt-1">In Progress</p>
            </div>
          </Card>
        </div>
      )}

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log a topic</h3>
        <LearningEntryForm onSaved={reload} />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter entries</h3>
        <div className="space-y-3">
          <SearchBar placeholder="Search by topic..." onSearch={onSearch}>
            <select
              value={track}
              onChange={(e) => {
                setTrack(e.target.value);
                search('', e.target.value, status);
              }}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {TRACKS.map((name) => (
                <option key={name} value={name}>
                  {name ? name.replace('_', ' ').toUpperCase() : 'All tracks'}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                search('', track, e.target.value);
              }}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {STATUSES.map((name) => (
                <option key={name} value={name}>
                  {name ? name.replace('_', ' ') : 'All statuses'}
                </option>
              ))}
            </select>
          </SearchBar>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Entries</h3>
        {entries.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No study progress yet</h3>
              <p className="text-gray-600">Log your first topic above to start tracking your learning journey.</p>
            </div>
          </Card>
        ) : (
          <LearningEntryList entries={entries} onStatusChange={setStatus} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
