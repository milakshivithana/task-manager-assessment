import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, status, priority, sortBy, sortOrder } = req.query;

    const tasks = await db.getTasks({
      userId,
      search: search as string,
      status: status as string,
      priority: priority as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    });

    const stats = await db.getTaskStats(userId);

    return res.status(200).json({
      success: true,
      data: tasks,
      stats,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await db.getTaskById(id, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task.' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, priority, status, due_date } = req.body;

    const newTask = await db.createTask({
      userId,
      title,
      description,
      priority,
      status,
      due_date,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingTask = await db.getTaskById(id, userId);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updatedTask = await db.updateTask(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await db.deleteTask(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found or already deleted.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

export const getTaskStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await db.getTaskStats(userId);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch task stats.' });
  }
};
