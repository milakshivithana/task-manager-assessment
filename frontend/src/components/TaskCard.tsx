import React from 'react';
import { Task, TaskStatus } from '../types';
import { Calendar, Edit2, Trash2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isCompleted = task.status === 'Completed';

  // Check if overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = dueDate < today && !isCompleted;

  // Format Due Date
  const formattedDueDate = new Date(task.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const priorityColors = {
    Low: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    Medium: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    High: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  };

  const statusIcons = {
    Pending: Clock,
    'In Progress': Clock,
    Completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status] || Clock;

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md border transition-all duration-200 flex flex-col justify-between ${
        isOverdue
          ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/10'
          : isCompleted
          ? 'border-gray-200 dark:border-slate-700/60 opacity-80'
          : 'border-gray-200 dark:border-slate-700'
      }`}
    >
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Priority Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityColors[task.priority]}`}
            >
              {task.priority} Priority
            </span>

            {/* Overdue Warning Badge */}
            {isOverdue && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>

          {/* Quick Edit / Delete Buttons */}
          <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base font-bold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2 ${
            isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info & Quick Status Toggle */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between mt-3 text-xs">
        {/* Due Date Indicator */}
        <div
          className={`flex items-center space-x-1.5 font-medium ${
            isOverdue
              ? 'text-rose-600 dark:text-rose-400 font-semibold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Due {formattedDueDate}</span>
        </div>

        {/* Interactive Status Selector */}
        <div className="relative inline-flex items-center">
          <StatusIcon
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
              task.status === 'Completed'
                ? 'text-emerald-500'
                : task.status === 'In Progress'
                ? 'text-sky-500'
                : 'text-amber-500'
            }`}
          />
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className={`pl-7 pr-2 py-1 rounded-lg font-semibold border text-xs cursor-pointer focus:outline-none transition-colors ${
              task.status === 'Completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                : task.status === 'In Progress'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
            }`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
