import { Database } from 'sqlite';

export interface CV {
  id?: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  current_role?: string;
  expected_salary?: string;
  cv_file_path?: string;
  created_at?: string;
  updated_at?: string;
}

export class CVModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  static create(db: Database): CVModel {
    return new CVModel(db);
  }

  async create(cv: Omit<CV, 'id' | 'created_at' | 'updated_at'>): Promise<CV> {
    const result = await this.db.run(
      `INSERT INTO cvs (user_id, full_name, email, phone, linkedin_url, current_role, expected_salary, cv_file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cv.user_id, cv.full_name, cv.email, cv.phone || null, cv.linkedin_url || null, cv.current_role || null, cv.expected_salary || null, cv.cv_file_path || null]
    );

    return {
      id: result.lastID,
      ...cv,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async findById(id: number): Promise<CV | null> {
    const row = await this.db.get(
      `SELECT * FROM cvs WHERE id = ?`,
      [id]
    );
    return row ? (row as CV) : null;
  }

  async findByUserId(userId: number): Promise<CV | null> {
    const row = await this.db.get(
      `SELECT * FROM cvs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return row ? (row as CV) : null;
  }

  async list(): Promise<any[]> {
    const rows = await this.db.all(
      `SELECT c.id, c.user_id, c.full_name, c.email, c.phone, c.linkedin_url,
              c.current_role, c.expected_salary, c.cv_file_path,
              c.created_at, c.updated_at,
              u.username as username, u.email as user_email
       FROM cvs c
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC`
    );
    return rows as any[];
  }

  async update(id: number, cv: Partial<CV>): Promise<CV | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const fieldMapping: any = {
      full_name: 'full_name',
      email: 'email',
      phone: 'phone',
      linkedin_url: 'linkedin_url',
      current_role: 'current_role',
      expected_salary: 'expected_salary',
      cv_file_path: 'cv_file_path'
    };

    for (const [key, value] of Object.entries(cv)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.run(
      `UPDATE cvs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run(`DELETE FROM cvs WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }
}
