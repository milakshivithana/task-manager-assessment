import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import { validateTaskPayload } from '../middleware/validate';

const router = Router();

// Apply auth middleware to all task routes
router.use(authenticateToken);

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', validateTaskPayload, createTask);
router.put('/:id', validateTaskPayload, updateTask);
router.delete('/:id', deleteTask);

export default router;
