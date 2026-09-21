import { db } from './index.ts';
import { applications } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Application } from '../types.ts';

export async function getAllApplications(): Promise<Application[]> {
  try {
    const rows = await db.select().from(applications).orderBy(desc(applications.createdAt));
    return rows.map((r) => ({
      id: r.id,
      candidateName: r.candidateName,
      position: r.position,
      appliedDate: r.appliedDate,
      status: r.status as Application['status'],
      email: r.email,
      portfolioUrl: r.portfolioUrl || '',
      avatarUrl: r.avatarUrl || undefined,
      experienceSummary: r.experienceSummary || [],
      attachments: r.attachments || [],
      notes: r.notes || undefined,
    }));
  } catch (error) {
    console.error('Database getAllApplications failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createApplication(appData: Omit<Application, 'id'> & { id?: string }): Promise<Application> {
  try {
    const id = appData.id || `app-${Date.now()}`;
    const [inserted] = await db.insert(applications).values({
      id,
      candidateName: appData.candidateName,
      position: appData.position,
      appliedDate: appData.appliedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: appData.status || 'New',
      email: appData.email,
      portfolioUrl: appData.portfolioUrl || '',
      avatarUrl: appData.avatarUrl || null,
      experienceSummary: appData.experienceSummary || [],
      attachments: appData.attachments || [],
      notes: appData.notes || '',
    }).returning();

    return {
      id: inserted.id,
      candidateName: inserted.candidateName,
      position: inserted.position,
      appliedDate: inserted.appliedDate,
      status: inserted.status as Application['status'],
      email: inserted.email,
      portfolioUrl: inserted.portfolioUrl || '',
      avatarUrl: inserted.avatarUrl || undefined,
      experienceSummary: inserted.experienceSummary || [],
      attachments: inserted.attachments || [],
      notes: inserted.notes || undefined,
    };
  } catch (error) {
    console.error('Database createApplication failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
  try {
    const updateValues: Record<string, any> = {};

    if (updates.candidateName !== undefined) updateValues.candidateName = updates.candidateName;
    if (updates.position !== undefined) updateValues.position = updates.position;
    if (updates.status !== undefined) updateValues.status = updates.status;
    if (updates.email !== undefined) updateValues.email = updates.email;
    if (updates.portfolioUrl !== undefined) updateValues.portfolioUrl = updates.portfolioUrl;
    if (updates.avatarUrl !== undefined) updateValues.avatarUrl = updates.avatarUrl;
    if (updates.experienceSummary !== undefined) updateValues.experienceSummary = updates.experienceSummary;
    if (updates.attachments !== undefined) updateValues.attachments = updates.attachments;
    if (updates.notes !== undefined) updateValues.notes = updates.notes;

    const [updated] = await db.update(applications)
      .set(updateValues)
      .where(eq(applications.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      candidateName: updated.candidateName,
      position: updated.position,
      appliedDate: updated.appliedDate,
      status: updated.status as Application['status'],
      email: updated.email,
      portfolioUrl: updated.portfolioUrl || '',
      avatarUrl: updated.avatarUrl || undefined,
      experienceSummary: updated.experienceSummary || [],
      attachments: updated.attachments || [],
      notes: updated.notes || undefined,
    };
  } catch (error) {
    console.error(`Database updateApplication failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteApplication(id: string): Promise<boolean> {
  try {
    const result = await db.delete(applications).where(eq(applications.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error(`Database deleteApplication failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
