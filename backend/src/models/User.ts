import { Database } from 'sqlite';

export interface User {
  id?: number;
  username: string;
  email: string;
  passwordHash: string;
  role?: 'job_seeker' | 'employer' | 'admin';
  createdAt?: string;
}

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  static create(db: Database): UserModel {
    return new UserModel(db);
  }

  setDb(db: Database) {
    this.db = db;
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const result = await this.db.run(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES (?, ?, ?, ?)`,
      [user.username, user.email, user.passwordHash, user.role || 'job_seeker']
    );

    return {
      id: result.lastID,
      ...user,
      createdAt: new Date().toISOString(),
    };
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.db.get(
      `SELECT id, username, email, password_hash as passwordHash, role, created_at as createdAt 
       FROM users WHERE id = ?`,
      [id]
    );
    return row ? (row as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.get(
      `SELECT id, username, email, password_hash as passwordHash, role, created_at as createdAt 
       FROM users WHERE email = ?`,
      [email]
    );
    return row ? (row as User) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.db.get(
      `SELECT id, username, email, password_hash as passwordHash, role, created_at as createdAt 
       FROM users WHERE username = ?`,
      [username]
    );
    return row ? (row as User) : null;
  }

  async update(id: number, user: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (user.username !== undefined) {
      fields.push('username = ?');
      values.push(user.username);
    }
    if (user.email !== undefined) {
      fields.push('email = ?');
      values.push(user.email);
    }
    if (user.passwordHash !== undefined) {
      fields.push('password_hash = ?');
      values.push(user.passwordHash);
    }
    if (user.role !== undefined) {
      fields.push('role = ?');
      values.push(user.role);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await this.db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }

  async list(): Promise<User[]> {
    const rows = await this.db.all(
      `SELECT id, username, email, password_hash as passwordHash, role, created_at as createdAt 
       FROM users ORDER BY created_at DESC`
    );
    return rows as User[];
  }
}
