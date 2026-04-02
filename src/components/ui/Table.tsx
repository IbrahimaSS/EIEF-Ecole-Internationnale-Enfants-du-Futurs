import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T) => void;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  onRowClick
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400 dark:text-gray-600" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />;
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5 ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-6 py-4 text-left text-[10px] font-semibold 
                  gradient-bleu-or-text   opacity-80
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-white/5">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={`
                hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150 group
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-600">
          <p className="font-semibold   text-[10px]">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}

export default Table;
