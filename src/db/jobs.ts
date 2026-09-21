import { db } from './index.ts';
import { jobs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { JobPosting } from '../types.ts';

export async function getAllJobs(): Promise<JobPosting[]> {
  try {
    const rows = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      department: r.department as JobPosting['department'],
      location: r.location,
      status: r.status as JobPosting['status'],
      postedDate: r.postedDate,
      description: r.description,
      requirements: r.requirements,
    }));
  } catch (error) {
    console.error('Database getAllJobs failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export interface CreateJobInput {
  id?: string;
  title: string;
  department: JobPosting['department'];
  location: string;
  status?: JobPosting['status'];
  postedDate?: string;
  description: string;
  requirements: string[];
}

export async function createJob(jobData: CreateJobInput): Promise<JobPosting> {
  try {
    const id = jobData.id || `job-${Date.now()}`;
    const [inserted] = await db.insert(jobs).values({
      id,
      title: jobData.title,
      department: jobData.department,
      location: jobData.location,
      status: jobData.status || 'Active',
      postedDate: jobData.postedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: jobData.description,
      requirements: jobData.requirements || [],
    }).returning();

    return {
      id: inserted.id,
      title: inserted.title,
      department: inserted.department as JobPosting['department'],
      location: inserted.location,
      status: inserted.status as JobPosting['status'],
      postedDate: inserted.postedDate,
      description: inserted.description,
      requirements: inserted.requirements,
    };
  } catch (error) {
    console.error('Database createJob failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting | null> {
  try {
    const updateValues: Record<string, any> = {};

    if (updates.title !== undefined) updateValues.title = updates.title;
    if (updates.department !== undefined) updateValues.department = updates.department;
    if (updates.location !== undefined) updateValues.location = updates.location;
    if (updates.status !== undefined) updateValues.status = updates.status;
    if (updates.description !== undefined) updateValues.description = updates.description;
    if (updates.requirements !== undefined) updateValues.requirements = updates.requirements;
    if (updates.postedDate !== undefined) updateValues.postedDate = updates.postedDate;

    const [updated] = await db.update(jobs)
      .set(updateValues)
      .where(eq(jobs.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      title: updated.title,
      department: updated.department as JobPosting['department'],
      location: updated.location,
      status: updated.status as JobPosting['status'],
      postedDate: updated.postedDate,
      description: updated.description,
      requirements: updated.requirements,
    };
  } catch (error) {
    console.error(`Database updateJob failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteJob(id: string): Promise<boolean> {
  try {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error(`Database deleteJob failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
