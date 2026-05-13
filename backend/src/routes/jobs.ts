import { Router } from 'express';
import { JobModel } from '../models/Job.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';
import { fetchJobs as fetchPublicJobs } from '../../services/api.ts';

const router = Router();
let jobModel: JobModel;

export function setJobModel(db: any) {
  jobModel = JobModel.create(db);
}

const serializeTags = (tags: any) => {
  if (Array.isArray(tags)) return JSON.stringify(tags.slice(0, 8));
  if (tags === undefined || tags === null) return undefined;
  return String(tags);
};

const toNumber = (value: any, fallback?: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const syncPublicJobs = async ({
  search = '',
  category = '',
  limit = 40,
}: {
  search?: string;
  category?: string;
  limit?: number;
}) => {
  try {
    const publicJobs = await fetchPublicJobs({
      search,
      category,
      limit: Math.min(Math.max(limit, 1), 80),
    });

    for (const publicJob of publicJobs) {
      const externalId = publicJob.id ? String(publicJob.id) : '';
      if (!externalId) continue;

      const existing = await jobModel.findByExternalId(externalId);
      const jobPayload = {
        externalId,
        source: 'public',
        title: publicJob.title,
        company: publicJob.company,
        companyLogo: publicJob.companyLogo,
        category: publicJob.category,
        rawCategory: publicJob.rawCategory,
        jobType: publicJob.jobType,
        location: publicJob.location,
        salary: publicJob.salary,
        description: publicJob.description,
        fullDescription: publicJob.fullDescription,
        url: publicJob.url,
        applicationUrl: publicJob.applicationUrl,
        applyUrl: publicJob.applyUrl,
        tags: serializeTags(publicJob.tags),
        postedAt: publicJob.postedAt,
        sourceName: publicJob.source || 'Remotive',
        featured: publicJob.featured || false,
      };

      if (existing?.id) {
        await jobModel.update(existing.id, jobPayload);
      } else {
        await jobModel.create(jobPayload);
      }
    }
  } catch (error: any) {
    console.warn('Public job sync skipped:', error?.message || error);
  }
};

router.get('/', async (req, res) => {
  try {
    const { search, category, limit, offset, sync } = req.query;
    const numericLimit = toNumber(limit, 40) || 40;
    const searchValue = (search as string) || '';
    const categoryValue = (category as string) || '';

    if (sync !== 'false') {
      await syncPublicJobs({
        search: searchValue,
        category: categoryValue,
        limit: numericLimit,
      });
    }

    const jobs = await jobModel.list({
      search: searchValue || undefined,
      category: categoryValue || undefined,
      limit: numericLimit,
      offset: toNumber(offset),
    });

    res.json({ data: jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await jobModel.list({
      postedByUserId: req.user!.id
    });
    res.json({ data: jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await jobModel.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ data: job });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, authorizeRole(['employer', 'admin']), async (req, res) => {
  try {
    const {
      externalId, source, title, company, companyLogo, category, rawCategory,
      jobType, location, salary, description, fullDescription, url,
      applicationUrl, applyUrl, tags, postedAt, sourceName, featured
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({ error: 'Title and company are required' });
    }

    const job = await jobModel.create({
      externalId,
      source: source || 'internal',
      title,
      company,
      companyLogo,
      category,
      rawCategory,
      jobType,
      location,
      salary,
      description,
      fullDescription: fullDescription || description,
      url,
      applicationUrl,
      applyUrl,
      tags: serializeTags(tags),
      postedAt,
      sourceName: sourceName || 'HireFlow',
      featured: featured || false,
      postedByUserId: req.user!.id
    });

    res.status(201).json({ data: job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await jobModel.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.postedByUserId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      externalId, source, title, company, companyLogo, category, rawCategory,
      jobType, location, salary, description, fullDescription, url,
      applicationUrl, applyUrl, tags, postedAt, sourceName, featured
    } = req.body;

    const updatedJob = await jobModel.update(id, {
      externalId,
      source,
      title,
      company,
      companyLogo,
      category,
      rawCategory,
      jobType,
      location,
      salary,
      description,
      fullDescription,
      url,
      applicationUrl,
      applyUrl,
      tags: serializeTags(tags),
      postedAt,
      sourceName,
      featured
    });

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ data: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await jobModel.findById(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.postedByUserId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const deleted = await jobModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
