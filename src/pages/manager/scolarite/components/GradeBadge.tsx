// src/pages/manager/scolarite/components/GradeBadge.tsx
import React from 'react';
import { cn } from '../../../../utils/cn';

interface Props {
  value: number;
}

const GradeBadge: React.FC<Props> = ({ value }) => {
  const color =
    value >= 16 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
    value >= 12 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
    value >= 10 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';

  return (
    <span className={cn('inline-block px-2.5 py-1 rounded-full text-[11px] font-bold', color)}>
      {value.toFixed(2)}/20
    </span>
  );
};

export default GradeBadge;
