import { Database } from 'sqlite';

export interface JobApplication {
  id?: number;
  userId: number;
  jobId: number;
  cvId?: number | null;
  coverNote?: string | null;
  status?: 'submitted' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  createdAt?: string;
  updatedAt?: string;
}

export class ApplicationModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  static create(db: Database): ApplicationModel {
    return new ApplicationModel(db);
  }

  async create(application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> {
    const result = await this.db.run(
      `INSERT INTO job_applications (user_id, job_id, cv_id, cover_note, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        application.userId,
        application.jobId,
        application.cvId || null,
        application.coverNote || null,
        application.status || 'submitted'
      ]
    );

    return {
      id: result.lastID,
      ...application,
      status: application.status || 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async findById(id: number): Promise<any | null> {
    const row = await this.db.get(
      `SELECT id, user_id as userId, job_id as jobId, cv_id as cvId,
              cover_note as coverNote, status, created_at as createdAt,
              updated_at as updatedAt
       FROM job_applications WHERE id = ?`,
      [id]
    );
    return row || null;
  }

  async findByUserAndJob(userId: number, jobId: number): Promise<any | null> {
    const row = await this.db.get(
      `SELECT id, user_id as userId, job_id as jobId, cv_id as cvId,
              cover_note as coverNote, status, created_at as createdAt,
              updated_at as updatedAt
       FROM job_applications WHERE user_id = ? AND job_id = ?`,
      [userId, jobId]
    );
    return row || null;
  }

  async list(options: { userId?: number; employerId?: number } = {}): Promise<any[]> {
    let query = `
      SELECT
        a.id,
        a.user_id as userId,
        a.job_id as jobId,
        a.cv_id as cvId,
        a.cover_note as coverNote,
        a.status,
        a.created_at as createdAt,
        a.updated_at as updatedAt,
        u.username as applicantName,
        u.email as applicantEmail,
        j.title as jobTitle,
        j.company as company,
        j.location as jobLocation,
        j.posted_by_user_id as postedByUserId,
        c.full_name as cvFullName,
        c.email as cvEmail,
        c.phone as cvPhone,
        c.current_role as currentRole,
        c.expected_salary as expectedSalary,
        c.cv_file_path as cvFilePath
      FROM job_applications a
      JOIN users u ON u.id = a.user_id
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN cvs c ON c.id = a.cv_id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (options.userId !== undefined) {
      query += ` AND a.user_id = ?`;
      values.push(options.userId);
    }

    if (options.employerId !== undefined) {
      query += ` AND j.posted_by_user_id = ?`;
      values.push(options.employerId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const rows = await this.db.all(query, values);
    return rows as any[];
  }

  async updateStatus(id: number, status: JobApplication['status']): Promise<any | null> {
    await this.db.run(
      `UPDATE job_applications SET status = ?, updated_at = ? WHERE id = ?`,
      [status, new Date().toISOString(), id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run(`DELETE FROM job_applications WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }
}
