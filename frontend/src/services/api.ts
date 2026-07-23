import axios from 'axios';
import { Task, TaskStats, FilterState } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const taskApi = {
  getTasks: async (filters: FilterState) => {
    const response = await api.get<{ success: boolean; data: Task[]; stats: TaskStats }>('/tasks', {
      params: {
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        sortBy: filters.sortBy,
      },
    });
    return response.data;
  },
  getTaskById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (payload: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    due_date: string;
  }) => {
    const response = await api.post<{ success: boolean; message: string; data: Task }>('/tasks', payload);
    return response.data;
  },
  updateTask: async (
    id: string,
    payload: {
      title?: string;
      description?: string;
      priority?: string;
      status?: string;
      due_date?: string;
    }
  ) => {
    const response = await api.put<{ success: boolean; message: string; data: Task }>(`/tasks/${id}`, payload);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return response.data;
  },
};

export default api;
