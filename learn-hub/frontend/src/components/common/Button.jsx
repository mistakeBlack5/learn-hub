import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  onClick,
  icon: Icon,
  ...props 
}) {
  const variants = {
    primary: 'gradient-bg text-white hover:shadow-lg hover:shadow-primary-500/30',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
}