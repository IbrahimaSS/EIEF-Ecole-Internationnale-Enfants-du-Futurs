import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'bordered' | 'glass';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900/50 dark:backdrop-blur-xl rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 p-6 border border-transparent dark:border-white/5',
    gradient: 'bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-white/10 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 dark:border-white/5',
    bordered: 'bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-or-500/30 transition-all duration-300 p-6 shadow-sm',
    glass: 'bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 dark:border-white/10'
  };

  const classes = cn(variants[variant], className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
