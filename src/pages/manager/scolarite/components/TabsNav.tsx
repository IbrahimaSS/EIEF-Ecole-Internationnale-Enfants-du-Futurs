// src/pages/manager/scolarite/components/TabsNav.tsx
import React from 'react';
import { CalendarDays, ClipboardList, Clock, Search } from 'lucide-react';
import { Card } from '../../../../components/ui';
import { TabId } from '../types';

interface Props {
  activeTab: TabId;
  onChangeTab: (id: TabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: typeof CalendarDays }> = [
  { id: 'emplois',  label: 'Emplois du temps', icon: CalendarDays },
  { id: 'notes',    label: 'Relevés de notes', icon: ClipboardList },
  { id: 'pointage', label: 'Pointage',         icon: Clock },
];

const TabsNav: React.FC<Props> = ({ activeTab, onChangeTab, searchQuery, onSearchChange }) => (
  <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none overflow-x-auto">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={e => {
                e.stopPropagation();
                onChangeTab(tab.id);
                onSearchChange('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-semibold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-or-500 text-bleu-600 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder={
            activeTab === 'emplois'
              ? 'Rechercher une classe...'
              : 'Rechercher un élève...'
          }
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-semibold text-gray-700 dark:text-white shadow-sm text-sm"
        />
      </div>
    </div>
  </Card>
);

export default TabsNav;
