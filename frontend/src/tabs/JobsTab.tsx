import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Briefcase, ExternalLink } from 'lucide-react';

export function JobsTab() {
  // Placeholder - JobAgent integration coming in phase 11
  const isConnected = false;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Job Matches</h2>
        <p className="text-slate-600 dark:text-slate-400">Roles matched and tailored for your background</p>
      </div>

      {!isConnected ? (
        <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <Briefcase className="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">JobAgent Coming Soon</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            Job matches will appear here once JobAgent scrapes postings from Greenhouse and Lever in phase 11.
            Applications always queue for your approval—never auto-submitted.
          </p>
          <div className="inline-flex gap-2">
            <Badge variant="info">Phase 11</Badge>
            <Badge variant="warning">Requires scraping</Badge>
            <Badge variant="success">Human-gated</Badge>
          </div>
        </Card>
      ) : (
        <>
          {/* Sample job card - will be replaced with real data */}
          {[
            {
              id: 1,
              title: 'Senior ML Engineer',
              company: 'Anthropic',
              match: 92,
              skills: ['Python', 'ML', 'LLMs'],
            },
            {
              id: 2,
              title: 'Full Stack Engineer',
              company: 'Vercel',
              match: 85,
              skills: ['React', 'FastAPI', 'Deployment'],
            },
          ].map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card hoverable className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{job.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{job.company}</p>
                  </div>
                  <Badge variant="success" size="md">
                    {job.match}% match
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    Approve Application
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink size={16} />
                    View Posting
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}
