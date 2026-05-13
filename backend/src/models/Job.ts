import { Database } from 'sqlite';

export interface Job {
  id?: number;
  externalId?: string;
  source?: string;
  title: string;
  company: string;
  companyLogo?: string;
  category?: string;
  rawCategory?: string;
  jobType?: string;
  location?: string;
  salary?: string;
  description?: string;
  fullDescription?: string;
  url?: string;
  applicationUrl?: string;
  applyUrl?: string;
  tags?: string;
  postedAt?: string;
  sourceName?: string;
  featured?: boolean;
  postedByUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class JobModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  static create(db: Database): JobModel {
    return new JobModel(db);
  }

  setDb(db: Database) {
    this.db = db;
  }

  async create(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const result = await this.db.run(
      `INSERT INTO jobs (
        external_id, source, title, company, company_logo, category, raw_category, 
        job_type, location, salary, description, full_description, url, 
        application_url, apply_url, tags, posted_at, source_name, featured, posted_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job.externalId || null,
        job.source || 'internal',
        job.title,
        job.company,
        job.companyLogo || null,
        job.category || null,
        job.rawCategory || null,
        job.jobType || null,
        job.location || null,
        job.salary || null,
        job.description || null,
        job.fullDescription || null,
        job.url || null,
        job.applicationUrl || null,
        job.applyUrl || null,
        job.tags || null,
        job.postedAt || null,
        job.sourceName || 'Remotive',
        job.featured ? 1 : 0,
        job.postedByUserId || null
      ]
    );

    return {
      id: result.lastID,
      ...job,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async findById(id: number): Promise<Job | null> {
    const row = await this.db.get(
      `SELECT id, external_id as externalId, source, title, company, company_logo as companyLogo, 
              category, raw_category as rawCategory, job_type as jobType, location, salary, 
              description, full_description as fullDescription, url, application_url as applicationUrl, 
              apply_url as applyUrl, tags, posted_at as postedAt, source_name as sourceName, 
              featured, posted_by_user_id as postedByUserId, created_at as createdAt, 
              updated_at as updatedAt 
       FROM jobs WHERE id = ?`,
      [id]
    );
    return row ? (row as Job) : null;
  }

  async findByExternalId(externalId: string): Promise<Job | null> {
    const row = await this.db.get(
      `SELECT id, external_id as externalId, source, title, company, company_logo as companyLogo, 
              category, raw_category as rawCategory, job_type as jobType, location, salary, 
              description, full_description as fullDescription, url, application_url as applicationUrl, 
              apply_url as applyUrl, tags, posted_at as postedAt, source_name as sourceName, 
              featured, posted_by_user_id as postedByUserId, created_at as createdAt, 
              updated_at as updatedAt 
       FROM jobs WHERE external_id = ?`,
      [externalId]
    );
    return row ? (row as Job) : null;
  }

  async update(id: number, job: Partial<Job>): Promise<Job | null> {
    const fields: string[] = [];
    const values: any[] = [];

    const fieldMapping: any = {
      externalId: 'external_id',
      source: 'source',
      title: 'title',
      company: 'company',
      companyLogo: 'company_logo',
      category: 'category',
      rawCategory: 'raw_category',
      jobType: 'job_type',
      location: 'location',
      salary: 'salary',
      description: 'description',
      fullDescription: 'full_description',
      url: 'url',
      applicationUrl: 'application_url',
      applyUrl: 'apply_url',
      tags: 'tags',
      postedAt: 'posted_at',
      sourceName: 'source_name',
      featured: 'featured',
      postedByUserId: 'posted_by_user_id'
    };

    for (const [key, value] of Object.entries(job)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    // Always update the updated_at timestamp
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.run(
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run(`DELETE FROM jobs WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }

  async list(options: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    postedByUserId?: number;
    featured?: boolean;
  } = {}): Promise<Job[]> {
    let query = `
      SELECT id, external_id as externalId, source, title, company, company_logo as companyLogo, 
             category, raw_category as rawCategory, job_type as jobType, location, salary, 
             description, full_description as fullDescription, url, application_url as applicationUrl, 
             apply_url as applyUrl, tags, posted_at as postedAt, source_name as sourceName, 
             featured, posted_by_user_id as postedByUserId, created_at as createdAt, 
             updated_at as updatedAt 
      FROM jobs WHERE 1=1
    `;
    const values: any[] = [];

    if (options.search) {
      query += ` AND (title LIKE ? OR company LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${options.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    if (options.category && options.category !== 'All') {
      query += ` AND category = ?`;
      values.push(options.category);
    }

    if (options.postedByUserId !== undefined) {
      query += ` AND posted_by_user_id = ?`;
      values.push(options.postedByUserId);
    }

    if (options.featured !== undefined) {
      query += ` AND featured = ?`;
      values.push(options.featured ? 1 : 0);
    }

    query += ` ORDER BY created_at DESC`;

    if (options.limit !== undefined) {
      query += ` LIMIT ?`;
      values.push(options.limit);
    }

    if (options.offset !== undefined) {
      query += ` OFFSET ?`;
      values.push(options.offset);
    }

    const rows = await this.db.all(query, values);
    return rows as Job[];
  }

  async count(options: {
    search?: string;
    category?: string;
    postedByUserId?: number;
    featured?: boolean;
  } = {}): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM jobs WHERE 1=1`;
    const values: any[] = [];

    if (options.search) {
      query += ` AND (title LIKE ? OR company LIKE ? OR description LIKE ?)`;
      const searchTerm = `%${options.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    if (options.category && options.category !== 'All') {
      query += ` AND category = ?`;
      values.push(options.category);
    }

    if (options.postedByUserId !== undefined) {
      query += ` AND posted_by_user_id = ?`;
      values.push(options.postedByUserId);
    }

    if (options.featured !== undefined) {
      query += ` AND featured = ?`;
      values.push(options.featured ? 1 : 0);
    }

    const row = await this.db.get(query, values);
    return row ? Number(row.count) : 0;
  }
}
