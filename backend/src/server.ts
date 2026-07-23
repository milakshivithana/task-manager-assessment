import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { db } from './db';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Database without blocking the export for Vercel
db.initialize().catch((err) => {
  console.error('Failed to initialize database:', err);
});

// Local machine eke nam (nattam testing nemei nam) witharak port eke listen karanna
// process.env.VERCEL kiyanne Vercel eken auto dena variable ekak
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel ekata deploy karaddi app eka export karanna one
export default app;