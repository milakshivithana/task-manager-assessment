import React from 'react';
import { TaskStats } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, PlayCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: TaskStats;
  selectedFilter: string;
  onSelectFilter: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all',
      title: 'Total Tasks',
      count: stats.totalTasks,
      icon: ListTodo,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 hover:bg-blue-100/80 text-blue-900',
      bgDark: 'dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      filterValue: '',
    },
    {
      id: 'pending',
      title: 'Pending',
      count: stats.pendingTasks,
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      bgLight: 'bg-amber-50 hover:bg-amber-100/80 text-amber-900',
      bgDark: 'dark:bg-slate-800 dark:hover:bg-slate-750 text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      filterValue: 'Pending',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      count: stats.inProgressTasks,
      icon: PlayCircle,
      color: 'from-sky-400 to-blue-600',
      bgLight: 'bg-sky-50 hover:bg-sky-100/80 text-sky-900',
      bgDark: 'dark:bg-slate-800 dark:hover:bg-slate-750 text-sky-400',
      borderColor: 'border-sky-200 dark:border-sky-900/50',
      filterValue: 'In Progress',
    },
    {
      id: 'completed',
      title: 'Completed',
      count: stats.completedTasks,
      icon: CheckCircle2,
      color: 'from-emerald-400 to-teal-600',
      bgLight: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900',
      bgDark: 'dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      filterValue: 'Completed',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      count: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      bgLight: 'bg-rose-50 hover:bg-rose-100/80 text-rose-900',
      bgDark: 'dark:bg-slate-800 dark:hover:bg-slate-750 text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-900/50',
      filterValue: 'Overdue',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = selectedFilter === c.filterValue;

        return (
          <div
            key={c.id}
            onClick={() => onSelectFilter(c.filterValue)}
            className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border transform hover:-translate-y-0.5 shadow-sm hover:shadow-md ${
              c.bgLight
            } ${c.bgDark} ${
              isActive
                ? 'ring-2 ring-sky-500 dark:ring-sky-400 shadow-sky-500/10'
                : c.borderColor
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {c.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {c.count}
              </span>
              {stats.totalTasks > 0 && c.id !== 'all' && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {Math.round((c.count / stats.totalTasks) * 100)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
