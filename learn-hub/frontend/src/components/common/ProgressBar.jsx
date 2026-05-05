import { motion } from 'framer-motion';

export default function ProgressBar({ progress, className, animated = true, showLabel = true }) {
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="gradient-bg h-2.5 rounded-full"
        />
      </div>
    </div>
  );
}