import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { DashboardStats } from '../components/DashboardStats';
import { TaskFilterBar } from '../components/TaskFilterBar';
import { TaskList } from '../components/TaskList';
import { TaskModal } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ToastNotification, ToastMessage } from '../components/ToastNotification';
import { Task, TaskStats, FilterState, TaskStatus, TaskPriority } from '../types';
import { taskApi } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    sortBy: 'newest',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskApi.getTasks(filters);
      if (data.success) {
        setTasks(data.data);
        setStats(data.stats);
      }
    } catch (err: any) {
      addToast('error', 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      sortBy: 'newest',
    });
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (formData: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string;
  }) => {
    try {
      if (taskToEdit) {
        const res = await taskApi.updateTask(taskToEdit.id, formData);
        if (res.success) {
          addToast('success', 'Task updated successfully!');
          fetchTasks();
        }
      } else {
        const res = await taskApi.createTask(formData);
        if (res.success) {
          addToast('success', 'Task created successfully!');
          fetchTasks();
        }
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Action failed.');
      throw err;
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await taskApi.updateTask(taskId, { status: newStatus });
      if (res.success) {
        addToast('success', `Status updated to ${newStatus}`);
        fetchTasks();
      }
    } catch (err: any) {
      addToast('error', 'Failed to update status.');
    }
  };

  const handleOpenDeleteModal = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDeleteId) return;
    try {
      const res = await taskApi.deleteTask(taskToDeleteId);
      if (res.success) {
        addToast('success', 'Task deleted successfully.');
        fetchTasks();
      }
    } catch (err: any) {
      addToast('error', 'Failed to delete task.');
    }
  };

  const taskToDelete = tasks.find((t) => t.id === taskToDeleteId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Analytics Bar */}
        <DashboardStats
          stats={stats}
          selectedFilter={filters.status}
          onSelectFilter={(status) => handleFilterChange({ status })}
        />

        {/* Filter, Search & Controls */}
        <TaskFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* Task Cards Grid / List */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onStatusChange={handleStatusChange}
          onOpenCreateModal={handleOpenCreateModal}
        />
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete ? taskToDelete.title : ''}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
