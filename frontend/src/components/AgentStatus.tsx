import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

type Status = 'idle' | 'running' | 'success' | 'error';

interface AgentStatusProps {
  name: string;
  status: Status;
  message?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    color: 'text-slate-400',
    label: 'Ready',
  },
  running: {
    icon: Loader,
    color: 'text-blue-500',
    label: 'Running',
  },
  success: {
    icon: CheckCircle,
    color: 'text-violet-500',
    label: 'Success',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    label: 'Error',
  },
};

export function AgentStatus({ name, status, message }: AgentStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {Icon && (
        <motion.div
          animate={status === 'running' ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={config.color}
        >
          <Icon size={20} />
        </motion.div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {name}
        </p>
        {message && (
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{message}</p>
        )}
      </div>
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </motion.div>
  );
}
