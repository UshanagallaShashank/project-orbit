import { motion } from 'framer-motion';
import { ResumeVersionForm } from '../ResumeVersionForm';
import { ResumeVersionList } from '../ResumeVersionList';
import { SearchBar } from '../SearchBar';
import { useResumeVersions } from '../useResumeVersions';
import { Card } from '../components/Card';
import { FileText } from 'lucide-react';

export function ResumeTab() {
  const { versions, reload, search, remove } = useResumeVersions();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Resume Versions</h2>
        <p className="text-slate-600 dark:text-slate-400">Manage and compare your resume versions</p>
      </div>

      {/* Save new version form */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Save a new version</h3>
        <ResumeVersionForm onSaved={reload} />
      </motion.section>

      {/* Search versions */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Search versions</h3>
        <SearchBar placeholder="Search by label..." onSearch={search} />
      </motion.section>

      {/* Versions list */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Versions</h3>
        {versions.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
              <FileText className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No resume versions yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Save your first version above to start tracking your resume iterations and tailoring for job
              descriptions.
            </p>
          </Card>
        ) : (
          <ResumeVersionList versions={versions} onDelete={remove} />
        )}
      </motion.section>
    </motion.div>
  );
}
