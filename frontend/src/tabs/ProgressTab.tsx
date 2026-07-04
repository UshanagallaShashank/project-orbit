import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { LearningEntryForm } from '../LearningEntryForm';
import { LearningEntryList } from '../LearningEntryList';
import { SearchBar } from '../SearchBar';
import { useLearningEntries } from '../useLearningEntries';
import { Card } from '../components/Card';
import { BookOpen } from 'lucide-react';

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

  // Calculate progress stats
  const stats = {
    total: entries.length,
    done: entries.filter((e) => e.status === 'done').length,
    inProgress: entries.filter((e) => e.status === 'in_progress').length,
  };

  const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header with stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Learning Progress</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Track your progress across learning tracks</p>

        {/* Progress overview */}
        {stats.total > 0 && (
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {progressPercent}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Overall Progress</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.done}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Completed</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.inProgress}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">In Progress</p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Add entry form */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Log a topic</h3>
        <LearningEntryForm onSaved={reload} />
      </motion.section>

      {/* Search and filters */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Filter entries</h3>
        <div className="space-y-3">
          <SearchBar placeholder="Search by topic..." onSearch={onSearch}>
            <select
              value={track}
              onChange={(event) => {
                setTrack(event.target.value);
                search('', event.target.value, status);
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500"
            >
              {TRACKS.map((name) => (
                <option key={name} value={name}>
                  {name ? name.replace('_', ' ').toUpperCase() : 'All tracks'}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                search('', track, event.target.value);
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500"
            >
              {STATUSES.map((name) => (
                <option key={name} value={name}>
                  {name ? name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1) : 'All statuses'}
                </option>
              ))}
            </select>
          </SearchBar>
        </div>
      </motion.section>

      {/* Entries list */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Entries</h3>
        {entries.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <BookOpen className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No study progress yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Log your first topic above to start tracking your learning journey.</p>
          </Card>
        ) : (
          <LearningEntryList entries={entries} onStatusChange={setStatus} onDelete={remove} />
        )}
      </motion.section>
    </motion.div>
  );
}
