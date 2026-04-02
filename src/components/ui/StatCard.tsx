import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'bleu' | 'or' | 'vert' | 'rouge';
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'bleu',
  trend
}) => {
  const colorMap = {
    bleu: 'from-bleu-500/10 to-bleu-600/5 text-bleu-600 dark:text-bleu-400 border-bleu-100 dark:border-bleu-900/30',
    or: 'from-or-500/10 to-or-600/5 text-or-600 dark:text-or-400 border-or-100 dark:border-or-900/30',
    vert: 'from-vert-500/10 to-vert-600/5 text-vert-600 dark:text-vert-400 border-vert-100 dark:border-vert-900/30',
    rouge: 'from-rouge-500/10 to-rouge-600/5 text-rouge-600 dark:text-rouge-400 border-rouge-100 dark:border-rouge-900/30',
  };

  const iconBgMap = {
    bleu: 'bg-bleu-100 dark:bg-bleu-900/40 text-bleu-600 dark:text-bleu-400',
    or: 'bg-or-100 dark:bg-or-900/40 text-or-600 dark:text-or-400',
    vert: 'bg-vert-100 dark:bg-vert-900/40 text-vert-600 dark:text-vert-400',
    rouge: 'bg-rouge-100 dark:bg-rouge-900/40 text-rouge-600 dark:text-rouge-400',
  };

  return (
    <div className={cn(
      "relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border-b-4 group",
      "shadow-soft hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300",
      colorMap[color]
    )}>
      {/* Left accent border */}
      <div className={cn(
        'absolute left-0 top-0 bottom-1 w-1.5 transition-opacity duration-300',
        color === 'bleu' ? 'bg-bleu-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
        color === 'or' ? 'bg-or-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
        color === 'vert' ? 'bg-vert-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
        'bg-rouge-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      )} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            {title}
          </p>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {value}
          </p>
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                trend.direction === 'up' ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"
              )}>
                {trend.direction === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {trend.value}
              </div>
              {subtitle && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}

          {!trend && subtitle && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-3">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className={cn("p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm", iconBgMap[color])}>
           {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>

      {/* Decorative pulse effect */}
      <div className={cn(
        "absolute -bottom-2 -right-2 w-24 h-24 blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-30",
        color === 'bleu' ? "bg-bleu-500" : color === 'or' ? "bg-or-500" : color === 'vert' ? "bg-vert-500" : "bg-rouge-500"
      )} />
    </div>
  );
};

export default StatCard;
