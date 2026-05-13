import { Router } from 'express';
import { ApplicationModel } from '../models/Application.ts';
import { CVModel } from '../models/CV.ts';
import { JobModel } from '../models/Job.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = Router();
let applicationModel: ApplicationModel;
let cvModel: CVModel;
let jobModel: JobModel;

const VALID_STATUSES = new Set(['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired']);

export function setApplicationModels(db: any) {
  applicationModel = ApplicationModel.create(db);
  cvModel = CVModel.create(db);
  jobModel = JobModel.create(db);
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    const jobId = Number(req.body.jobId);
    const coverNote = req.body.coverNote ? String(req.body.coverNote) : '';

    if (!Number.isFinite(jobId)) {
      return res.status(400).json({ error: 'Valid jobId is required' });
    }

    const job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const existingApplication = await applicationModel.findByUserAndJob(req.user!.id, jobId);
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this job', data: existingApplication });
    }

    const cv = await cvModel.findByUserId(req.user!.id);
    const application = await applicationModel.create({
      userId: req.user!.id,
      jobId,
      cvId: cv?.id || null,
      coverNote,
      status: 'submitted'
    });

    res.status(201).json({
      message: cv ? 'Application submitted successfully' : 'Application submitted. Upload a CV to strengthen it.',
      data: application
    });
  } catch (error: any) {
    console.error('Create application error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/my', authenticateToken, async (req, res) => {
  try {
    const applications = await applicationModel.list({ userId: req.user!.id });
    res.json({ data: applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, authorizeRole(['employer', 'admin']), async (req, res) => {
  try {
    const applications = req.user!.role === 'admin'
      ? await applicationModel.list()
      : await applicationModel.list({ employerId: req.user!.id });

    res.json({ data: applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', authenticateToken, authorizeRole(['employer', 'admin']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await applicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (req.user!.role !== 'admin') {
      const job = await jobModel.findById(application.jobId);
      if (!job || job.postedByUserId !== req.user!.id) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    const updatedApplication = await applicationModel.updateStatus(id, status as any);
    res.json({ data: updatedApplication });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
