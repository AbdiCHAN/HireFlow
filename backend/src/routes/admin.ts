import { Router } from 'express';
import { UserModel } from '../models/User.ts';
import { JobModel } from '../models/Job.ts';
import { CVModel } from '../models/CV.ts';
import { ApplicationModel } from '../models/Application.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = Router();
let userModel: UserModel;
let jobModel: JobModel;
let cvModel: CVModel;
let applicationModel: ApplicationModel;

export function setAdminModels(db: any) {
  userModel = UserModel.create(db);
  jobModel = JobModel.create(db);
  cvModel = CVModel.create(db);
  applicationModel = ApplicationModel.create(db);
}

router.get('/overview', authenticateToken, authorizeRole(['admin']), async (_req, res) => {
  try {
    const [users, jobs, cvs, applications] = await Promise.all([
      userModel.list(),
      jobModel.list({ limit: 500 }),
      cvModel.list(),
      applicationModel.list(),
    ]);

    const safeUsers = users.map(({ passwordHash, ...user }) => user);

    res.json({
      data: {
        stats: {
          users: safeUsers.length,
          jobs: jobs.length,
          cvs: cvs.length,
          applications: applications.length,
        },
        users: safeUsers,
        jobs,
        cvs,
        applications,
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
