import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController';
import { validateLoginPayload } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validateLoginPayload, login);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
