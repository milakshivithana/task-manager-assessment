import { Request, Response, NextFunction } from 'express';

export const validateTaskPayload = (req: Request, res: Response, next: NextFunction) => {
  const { title, priority, status, due_date } = req.body;
  const errors: Record<string, string> = {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Title is required.';
  }

  if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
    errors.priority = 'Priority must be Low, Medium, or High.';
  }

  if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
    errors.status = 'Status must be Pending, In Progress, or Completed.';
  }

  if (!due_date) {
    errors.due_date = 'Due date is required.';
  } else {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.due_date = 'Invalid due date format.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkDate = new Date(due_date);
      checkDate.setHours(0, 0, 0, 0);

      // Only enforce non-past due date for newly created tasks or when explicitly updating due date to a new past date
      if (req.method === 'POST' && checkDate < today) {
        errors.due_date = 'Due date cannot be earlier than today.';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

export const validateLoginPayload = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: Record<string, string> = {};

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.email = 'Email is required.';
  }
  if (!password || typeof password !== 'string' || password === '') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};
