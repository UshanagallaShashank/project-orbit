import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { CheckCircle2, Clock } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TodayTab() {
  // Placeholder state - TaskAgent integration coming in phase 7
  const isConnected = false;

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Today</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your prioritized tasks for the day, ranked by urgency
        </p>
      </div>

      {!isConnected ? (
        <motion.div variants={item}>
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <Clock className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              TaskAgent Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              Your tasks will appear here once TaskAgent is connected to Google Calendar in phase 7. For now,
              check your calendar directly.
            </p>
            <div className="inline-flex gap-2">
              <Badge variant="info">Phase 7</Badge>
              <Badge variant="neutral">Requires OAuth</Badge>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Sample task list - will be replaced with real data */}
          {[
            { id: 1, title: 'DSA: Binary Trees', priority: 'high', time: '9:00 AM' },
            { id: 2, title: 'Code review: ResumeAgent', priority: 'high', time: '10:30 AM' },
            { id: 3, title: 'Job application follow-ups', priority: 'medium', time: '2:00 PM' },
          ].map((task) => (
            <motion.div key={task.id} variants={item}>
              <Card hoverable className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <button className="mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <CheckCircle2 size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{task.time}</p>
                  </div>
                </div>
                <Badge variant={task.priority === 'high' ? 'danger' : 'warning'} size="sm">
                  {task.priority}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}
