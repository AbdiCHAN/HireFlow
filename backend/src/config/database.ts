import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../../data/hireflow.db');

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const connectDB = async () => {
  if (db) return db;

  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec('PRAGMA foreign_keys = ON');
    
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

export const closeDB = async () => {
  if (db) {
    await db.close();
    db = null;
    console.log('Database connection closed');
  }
};

export async function initializeDB(db: Database) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'job_seeker',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT,
      source TEXT NOT NULL DEFAULT 'internal',
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      company_logo TEXT,
      category TEXT,
      raw_category TEXT,
      job_type TEXT,
      location TEXT,
      salary TEXT,
      description TEXT,
      full_description TEXT,
      url TEXT,
      application_url TEXT,
      apply_url TEXT,
      tags TEXT,
      posted_at DATETIME,
      source_name TEXT DEFAULT 'Remotive',
      featured BOOLEAN DEFAULT 0,
      posted_by_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      linkedin_url TEXT,
      current_role TEXT,
      expected_salary TEXT,
      cv_file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      cv_id INTEGER,
      cover_note TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE SET NULL
    )
  `);

  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
    CREATE INDEX IF NOT EXISTS idx_jobs_posted_by_user_id ON jobs(posted_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
  `);

  console.log('Database initialized successfully');
}
