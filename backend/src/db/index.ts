import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date: string;
  created_at: string;
  updated_at: string;
}

class DatabaseManager {
  private pgPool: Pool | null = null;
  private sqliteDb: Database | null = null;
  private isPg: boolean = false;

  async initialize(): Promise<void> {
    const pgUrl = process.env.DATABASE_URL;
    if (pgUrl && process.env.USE_POSTGRES === 'true') {
      try {
        const pool = new Pool({
          connectionString: pgUrl,
          connectionTimeoutMillis: 3000,
        });
        await pool.query('SELECT 1');
        this.pgPool = pool;
        this.isPg = true;
        console.log('Connected to PostgreSQL Database.');
        await this.initPgTables();
        return;
      } catch (err) {
        console.warn('PostgreSQL connection failed, falling back to SQLite:', (err as Error).message);
      }
    }

    // Fallback SQLite Database
    const dbPath = path.resolve(__dirname, '../../../database/taskmanager.sqlite');
    this.sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    this.isPg = false;
    console.log(`Connected to SQLite Database at ${dbPath}`);
    await this.initSqliteTables();
  }

  private async initPgTables() {
    if (!this.pgPool) return;
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(10) CHECK (priority IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Medium',
        status VARCHAR(20) CHECK (status IN ('Pending', 'In Progress', 'Completed')) NOT NULL DEFAULT 'Pending',
        due_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.seedDefaultData();
  }

  private async initSqliteTables() {
    if (!this.sqliteDb) return;
    await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Medium',
        status TEXT CHECK (status IN ('Pending', 'In Progress', 'Completed')) NOT NULL DEFAULT 'Pending',
        due_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await this.seedDefaultData();
  }

  private async seedDefaultData() {
    const adminEmail = 'admin@test.com';
    const adminUser = await this.findUserByEmail(adminEmail);
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const userId = 'usr_admin_001';
      const now = new Date().toISOString();

      if (this.isPg && this.pgPool) {
        await this.pgPool.query(
          `INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, 'Admin User', adminEmail, hashedPassword, now, now]
        );
      } else if (this.sqliteDb) {
        await this.sqliteDb.run(
          `INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, 'Admin User', adminEmail, hashedPassword, now, now]
        );
      }

      // Seed Initial Tasks
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const todayStr = new Date().toISOString().split('T')[0];

      const seedTasks = [
        {
          id: 'tsk_001',
          user_id: userId,
          title: 'Complete Technical Assessment',
          description: 'Develop and submit full-stack task management application for Koncepthive.',
          priority: 'High',
          status: 'In Progress',
          due_date: tomorrowStr,
        },
        {
          id: 'tsk_002',
          user_id: userId,
          title: 'Review Code Quality & Security',
          description: 'Check clean code architecture, error handling, and security standards.',
          priority: 'Medium',
          status: 'Pending',
          due_date: nextWeekStr,
        },
        {
          id: 'tsk_003',
          user_id: userId,
          title: 'Database Schema Verification',
          description: 'Ensure foreign keys and indexes are set up properly for optimal performance.',
          priority: 'Low',
          status: 'Completed',
          due_date: todayStr,
        }
      ];

      for (const t of seedTasks) {
        if (this.isPg && this.pgPool) {
          await this.pgPool.query(
            `INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [t.id, t.user_id, t.title, t.description, t.priority, t.status, t.due_date, now, now]
          );
        } else if (this.sqliteDb) {
          await this.sqliteDb.run(
            `INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [t.id, t.user_id, t.title, t.description, t.priority, t.status, t.due_date, now, now]
          );
        }
      }
      console.log('Seeded default admin user (admin@test.com) and initial tasks.');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isPg && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0] || null;
    } else if (this.sqliteDb) {
      const res = await this.sqliteDb.get('SELECT * FROM users WHERE email = ?', [email]);
      return res || null;
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    if (this.isPg && this.pgPool) {
      const res = await this.pgPool.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else if (this.sqliteDb) {
      const res = await this.sqliteDb.get('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
      return res || null;
    }
    return null;
  }

  async getTasks(params: {
    userId: string;
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    const { userId, search, status, priority, sortBy = 'created_at', sortOrder = 'desc' } = params;

    let query = `SELECT * FROM tasks WHERE user_id = ${this.isPg ? '$1' : '?'}`;
    const values: any[] = [userId];
    let paramIdx = 2;

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      query += ` AND LOWER(title) LIKE ${this.isPg ? `$${paramIdx++}` : '?'}`;
      values.push(searchPattern.toLowerCase());
    }

    if (status && status.trim() !== '') {
      query += ` AND status = ${this.isPg ? `$${paramIdx++}` : '?'}`;
      values.push(status.trim());
    }

    if (priority && priority.trim() !== '') {
      query += ` AND priority = ${this.isPg ? `$${paramIdx++}` : '?'}`;
      values.push(priority.trim());
    }

    const validSortFields: Record<string, string> = {
      newest: 'created_at DESC',
      oldest: 'created_at ASC',
      due_date: 'due_date ASC',
      created_at: `created_at ${sortOrder.toUpperCase()}`,
      priority: 'priority ASC',
      title: 'title ASC'
    };

    const orderClause = validSortFields[sortBy] || `created_at ${sortOrder.toUpperCase()}`;
    query += ` ORDER BY ${orderClause}`;

    if (this.isPg && this.pgPool) {
      const res = await this.pgPool.query(query, values);
      return res.rows;
    } else if (this.sqliteDb) {
      return await this.sqliteDb.all(query, values);
    }
    return [];
  }

  async getTaskById(id: string, userId: string): Promise<Task | null> {
    if (this.isPg && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      return res.rows[0] || null;
    } else if (this.sqliteDb) {
      const res = await this.sqliteDb.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
      return res || null;
    }
    return null;
  }

  async createTask(task: {
    userId: string;
    title: string;
    description?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Completed';
    due_date: string;
  }): Promise<Task> {
    const id = `tsk_${uuidv4()}`;
    const now = new Date().toISOString();
    const desc = task.description || null;

    if (this.isPg && this.pgPool) {
      const query = `
        INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const res = await this.pgPool.query(query, [id, task.userId, task.title, desc, task.priority, task.status, task.due_date, now, now]);
      return res.rows[0];
    } else if (this.sqliteDb) {
      await this.sqliteDb.run(
        `INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, task.userId, task.title, desc, task.priority, task.status, task.due_date, now, now]
      );
      const created = await this.sqliteDb.get('SELECT * FROM tasks WHERE id = ?', [id]);
      return created;
    }
    throw new Error('Database not initialized');
  }

  async updateTask(
    id: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'Low' | 'Medium' | 'High';
      status?: 'Pending' | 'In Progress' | 'Completed';
      due_date?: string;
    }
  ): Promise<Task | null> {
    const existing = await this.getTaskById(id, userId);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const description = updates.description !== undefined ? updates.description : existing.description;
    const priority = updates.priority !== undefined ? updates.priority : existing.priority;
    const status = updates.status !== undefined ? updates.status : existing.status;
    const due_date = updates.due_date !== undefined ? updates.due_date : existing.due_date;
    const now = new Date().toISOString();

    if (this.isPg && this.pgPool) {
      const query = `
        UPDATE tasks 
        SET title = $1, description = $2, priority = $3, status = $4, due_date = $5, updated_at = $6
        WHERE id = $7 AND user_id = $8
        RETURNING *;
      `;
      const res = await this.pgPool.query(query, [title, description, priority, status, due_date, now, id, userId]);
      return res.rows[0];
    } else if (this.sqliteDb) {
      await this.sqliteDb.run(
        `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
        [title, description, priority, status, due_date, now, id, userId]
      );
      return await this.getTaskById(id, userId);
    }
    return null;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    if (this.isPg && this.pgPool) {
      const res = await this.pgPool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      return (res.rowCount ?? 0) > 0;
    } else if (this.sqliteDb) {
      const res = await this.sqliteDb.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
      return (res.changes ?? 0) > 0;
    }
    return false;
  }

  async getTaskStats(userId: string): Promise<{
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }> {
    const tasks = await this.getTasks({ userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalTasks = tasks.length;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    for (const t of tasks) {
      if (t.status === 'Pending') pendingTasks++;
      else if (t.status === 'In Progress') inProgressTasks++;
      else if (t.status === 'Completed') completedTasks++;

      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Overdue if due_date < today and not completed
      if (dueDate < today && t.status !== 'Completed') {
        overdueTasks++;
      }
    }

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
    };
  }
}

export const db = new DatabaseManager();
