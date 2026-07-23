import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { db } from '../db';

describe('Task Management API Tests', () => {
  let authToken: string;
  let taskId: string;

  beforeAll(async () => {
    await db.initialize();
  });

  describe('Authentication Endpoints', () => {
    it('should fail login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with default credentials admin@test.com / 123456', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it('should fetch current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@test.com');
    });
  });

  describe('Task API Endpoints', () => {
    it('should reject unauthenticated request to /api/tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('should fail creating task with missing required title', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',
          priority: 'High',
          status: 'Pending',
          due_date: tomorrow.toISOString().split('T')[0],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.title).toBeDefined();
    });

    it('should fail creating task with past due date', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Past Task',
          priority: 'High',
          status: 'Pending',
          due_date: '2020-01-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.due_date).toBe('Due date cannot be earlier than today.');
    });

    it('should successfully create a valid new task', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unit Test Task',
          description: 'Testing task creation via vitest',
          priority: 'High',
          status: 'Pending',
          due_date: nextWeek.toISOString().split('T')[0],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Unit Test Task');
      taskId = res.body.data.id;
    });

    it('should fetch list of tasks and stats', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.stats.totalTasks).toBeGreaterThan(0);
    });

    it('should update an existing task status to Completed', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unit Test Task Updated',
          priority: 'High',
          status: 'Completed',
          due_date: nextWeek.toISOString().split('T')[0],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Completed');
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
