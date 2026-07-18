// Personal tools consolidated into one page: Money, Resume, Jobs, Progress - not agent-facing.
// Each tab is styled with the shared mission-deck design system and staggered entry motion.
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, FileText, Wallet } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useExpenses, type Expense } from './useExpenses';
import { useLearningEntries } from './useLearningEntries';
import { useResumeVersions } from './useResumeVersions';

const SECTIONS = ['Money', 'Resume', 'Jobs', 'Progress'] as const;
type Section = (typeof SECTIONS)[number];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function OpsPage() {
  const [active, setActive] = useState<Section>('Money');

  return (
    <div>
      <h1 className="page-title">Ops</h1>
      <p className="page-sub">Personal tools, not agent-facing.</p>
      <div className="tab-bar">
        {SECTIONS.map((section) => (
          <button
            key={section}
            className={active === section ? 'on' : ''}
            onClick={() => setActive(section)}
          >
            {section}
          </button>
        ))}
      </div>
      {active === 'Money' && <MoneyTab />}
      {active === 'Resume' && <ResumeTab />}
      {active === 'Jobs' && <JobsTab />}
      {active === 'Progress' && <ProgressTab />}
    </div>
  );
}

/* ============ Money ============ */

const DEFAULT_CATEGORIES = ['food', 'transport', 'rent', 'shopping', 'health', 'entertainment', 'other'];

function MoneyTab() {
  const { expenses, summary, reload, search, remove } = useExpenses();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const knownCategories = useMemo(() => [...new Set(expenses.map((e) => e.category))], [expenses]);
  const suggestions = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...knownCategories])].sort(),
    [knownCategories],
  );

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    const max = Math.max(1, ...totals.values());
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total, pct: Math.round((total / max) * 100) }));
  }, [expenses]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    await fetch('/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(amount),
        category: newCategory.trim().toLowerCase() || 'other',
        note,
      }),
    }).catch(() => null);
    setSaving(false);
    setAmount('');
    setNewCategory('');
    setNote('');
    reload();
  };

  const usedPct =
    summary && summary.budget > 0 ? Math.min(100, Math.round((summary.spent / summary.budget) * 100)) : 0;
  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {summary && (
        <motion.div variants={rise} className="meter-card">
          <div className="meter-top">
            <span className="meter-title">{monthLabel}</span>
            <span className="meter-note">{usedPct}% of budget used</span>
          </div>
          <div className="meter-track">
            <div className={`meter-fill${usedPct > 90 ? ' danger' : ''}`} style={{ width: `${usedPct}%` }} />
          </div>
          <div className="meter-stats">
            <div className="meter-stat">
              <div className="k">Spent</div>
              <div className="v">
                {summary.spent.toLocaleString('en-IN')} <small>INR</small>
              </div>
            </div>
            <div className="meter-stat">
              <div className="k">Budget</div>
              <div className="v">
                {summary.budget.toLocaleString('en-IN')} <small>INR</small>
              </div>
            </div>
            <div className="meter-stat">
              <div className="k">Remaining</div>
              <div className="v good">
                {summary.remaining.toLocaleString('en-IN')} <small>INR</small>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {byCategory.length > 0 && (
        <motion.div variants={rise} className="meter-card">
          <div className="meter-top">
            <span className="meter-title">Where the money went</span>
          </div>
          {byCategory.map((cat) => (
            <div key={cat.name} className="cat-row">
              <span className="cname">{cat.name}</span>
              <span className="cbar-track">
                <span className="cbar" style={{ width: `${cat.pct}%` }} />
              </span>
              <span className="cval">{cat.total.toLocaleString('en-IN')} INR</span>
            </div>
          ))}
        </motion.div>
      )}

      <motion.form variants={rise} className="form-card" onSubmit={submit} style={{ marginBottom: 16 }}>
        <div className="field-group">
          <span className="field-label">Amount (INR)</span>
          <input
            type="number"
            className="text-input"
            style={{ width: 120 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="250"
            required
          />
        </div>
        <div className="field-group grow">
          <span className="field-label">Category (pick or type a new one)</span>
          <input
            list="category-options"
            className="text-input"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="food, ai tools, anything"
          />
          <datalist id="category-options">
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="field-group grow">
          <span className="field-label">Note</span>
          <input
            className="text-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="lunch at the mess"
          />
        </div>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving...' : 'Add expense'}
        </button>
      </motion.form>

      <motion.div variants={rise} className="filter-row">
        <input
          className="text-input"
          placeholder="Search by note..."
          onChange={(e) => search(e.target.value, category)}
        />
        <select
          className="select-input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            search('', e.target.value);
          }}
        >
          <option value="">All categories</option>
          {knownCategories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={rise}>
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="eicon">
              <Wallet size={20} />
            </div>
            <h4>No expenses logged yet</h4>
            <p>Add your first expense above to start tracking your spending against your monthly budget.</p>
          </div>
        ) : (
          <div className="list-card">
            {expenses.map((expense: Expense) => (
              <div key={expense.id} className="list-row">
                <div className="list-main">
                  <div className="list-title">{expense.note || expense.category}</div>
                  <div className="list-meta">
                    {expense.category} - {new Date(expense.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span className="amount">-{expense.amount.toLocaleString('en-IN')} INR</span>
                <button className="link-btn" onClick={() => void remove(expense.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ============ Resume ============ */

function ResumeTab() {
  const { versions, reload, search, remove } = useResumeVersions();
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim() || !content.trim()) return;
    setSaving(true);
    await fetch('/resume/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, content }),
    }).catch(() => null);
    setSaving(false);
    setLabel('');
    setContent('');
    reload();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.form variants={rise} className="form-card stack" onSubmit={submit} style={{ marginBottom: 16 }}>
        <div className="field-group">
          <span className="field-label">Version label</span>
          <input
            className="text-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="v3 - SDE roles"
          />
        </div>
        <div className="field-group">
          <span className="field-label">Content</span>
          <textarea
            className="textarea-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the resume text for this version..."
          />
        </div>
        <button type="submit" className="btn primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving...' : 'Save version'}
        </button>
      </motion.form>

      <motion.div variants={rise} className="filter-row">
        <input className="text-input" placeholder="Search by label..." onChange={(e) => search(e.target.value)} />
      </motion.div>

      <motion.div variants={rise}>
        {versions.length === 0 ? (
          <div className="empty-state">
            <div className="eicon">
              <FileText size={20} />
            </div>
            <h4>No resume versions yet</h4>
            <p>Save your first version above to start tracking your resume iterations.</p>
          </div>
        ) : (
          <div className="list-card">
            {versions.map((version) => (
              <div key={version.id} className="list-row">
                <div className="list-main">
                  <div className="list-title">{version.label || 'untitled'}</div>
                  <div className="list-meta">{new Date(version.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <button className="link-btn" onClick={() => void remove(version.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ============ Jobs ============ */

function JobsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="empty-state">
        <div className="eicon">
          <Briefcase size={20} />
        </div>
        <h4>JobAgent coming soon</h4>
        <p>
          Job matches will appear here once JobAgent scrapes postings from Greenhouse and Lever in
          phase 11. Applications always queue for your approval - never auto-submitted.
        </p>
        <div className="badges">
          <span className="badge info">Phase 11</span>
          <span className="badge warn">Requires scraping</span>
          <span className="badge ok">Human-gated</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============ Progress ============ */

const TRACKS = ['dsa', 'core_ml', 'modern_ai', 'sysdesign'];
const STATUSES = ['not_started', 'in_progress', 'done'];

function ProgressTab() {
  const { entries, reload, search, setStatus, remove } = useLearningEntries();
  const [track, setTrack] = useState('dsa');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterTrack, setFilterTrack] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const stats = useMemo(() => {
    const done = entries.filter((e) => e.status === 'done').length;
    const inProgress = entries.filter((e) => e.status === 'in_progress').length;
    const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
    return { done, inProgress, pct };
  }, [entries]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;
    setSaving(true);
    await fetch('/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track, topic, status: 'in_progress' }),
    }).catch(() => null);
    setSaving(false);
    setTopic('');
    reload();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {entries.length > 0 && (
        <motion.div variants={rise} className="stat-trio">
          <div className="trio-tile">
            <div className="v">{stats.pct}%</div>
            <div className="k">Overall progress</div>
          </div>
          <div className="trio-tile">
            <div className="v violet">{stats.done}</div>
            <div className="k">Completed</div>
          </div>
          <div className="trio-tile">
            <div className="v cyan">{stats.inProgress}</div>
            <div className="k">In progress</div>
          </div>
        </motion.div>
      )}

      <motion.form variants={rise} className="form-card" onSubmit={submit} style={{ marginBottom: 16 }}>
        <div className="field-group">
          <span className="field-label">Track</span>
          <select className="select-input" value={track} onChange={(e) => setTrack(e.target.value)}>
            {TRACKS.map((name) => (
              <option key={name} value={name}>
                {name.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group grow">
          <span className="field-label">Topic</span>
          <input
            className="text-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="binary search trees"
          />
        </div>
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving...' : 'Log topic'}
        </button>
      </motion.form>

      <motion.div variants={rise} className="filter-row">
        <input
          className="text-input"
          placeholder="Search by topic..."
          onChange={(e) => search(e.target.value, filterTrack, filterStatus)}
        />
        <select
          className="select-input"
          value={filterTrack}
          onChange={(e) => {
            setFilterTrack(e.target.value);
            search('', e.target.value, filterStatus);
          }}
        >
          <option value="">All tracks</option>
          {TRACKS.map((name) => (
            <option key={name} value={name}>
              {name.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            search('', filterTrack, e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((name) => (
            <option key={name} value={name}>
              {name.replace('_', ' ')}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={rise}>
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="eicon">
              <BookOpen size={20} />
            </div>
            <h4>No study progress yet</h4>
            <p>Log your first topic above to start tracking your learning journey.</p>
          </div>
        ) : (
          <div className="list-card">
            {entries.map((entry) => (
              <div key={entry.id} className="list-row">
                <div className="list-main">
                  <div className="list-title">{entry.topic}</div>
                  <div className="list-meta">{entry.track}</div>
                </div>
                <select
                  className="select-input"
                  style={{ padding: '5px 8px', fontSize: 11 }}
                  value={entry.status}
                  onChange={(e) => void setStatus(entry, e.target.value)}
                >
                  {STATUSES.map((name) => (
                    <option key={name} value={name}>
                      {name.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button className="link-btn" onClick={() => void remove(entry.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
