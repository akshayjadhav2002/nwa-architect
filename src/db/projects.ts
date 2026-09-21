import { db } from './index.ts';
import { projects } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { Project } from '../types.ts';

export async function getAllProjects(): Promise<Project[]> {
  try {
    const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category as Project['category'],
      location: r.location,
      year: r.year,
      description: r.description,
      imageUrl: r.imageUrl,
      status: r.status as Project['status'],
      lastEdited: r.lastEdited || undefined,
      editedBy: r.editedBy || undefined,
    }));
  } catch (error) {
    console.error('Database getAllProjects failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export interface CreateProjectInput {
  id?: string;
  title: string;
  category: Project['category'];
  location: string;
  year: number;
  description: string;
  imageUrl: string;
  status?: Project['status'];
  lastEdited?: string;
  editedBy?: string;
}

export async function createProject(projectData: CreateProjectInput): Promise<Project> {
  try {
    const id = projectData.id || `proj-${Date.now()}`;
    const [inserted] = await db.insert(projects).values({
      id,
      title: projectData.title,
      category: projectData.category,
      location: projectData.location,
      year: projectData.year,
      description: projectData.description,
      imageUrl: projectData.imageUrl,
      status: projectData.status || 'In Progress',
      lastEdited: projectData.lastEdited || 'Just now',
      editedBy: projectData.editedBy || 'Admin',
    }).returning();

    return {
      id: inserted.id,
      title: inserted.title,
      category: inserted.category as Project['category'],
      location: inserted.location,
      year: inserted.year,
      description: inserted.description,
      imageUrl: inserted.imageUrl,
      status: inserted.status as Project['status'],
      lastEdited: inserted.lastEdited || undefined,
      editedBy: inserted.editedBy || undefined,
    };
  } catch (error) {
    console.error('Database createProject failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const updateValues: Record<string, any> = {
      lastEdited: 'Just now',
      editedBy: updates.editedBy || 'Admin',
    };

    if (updates.title !== undefined) updateValues.title = updates.title;
    if (updates.category !== undefined) updateValues.category = updates.category;
    if (updates.location !== undefined) updateValues.location = updates.location;
    if (updates.year !== undefined) updateValues.year = updates.year;
    if (updates.description !== undefined) updateValues.description = updates.description;
    if (updates.imageUrl !== undefined) updateValues.imageUrl = updates.imageUrl;
    if (updates.status !== undefined) updateValues.status = updates.status;

    const [updated] = await db.update(projects)
      .set(updateValues)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      title: updated.title,
      category: updated.category as Project['category'],
      location: updated.location,
      year: updated.year,
      description: updated.description,
      imageUrl: updated.imageUrl,
      status: updated.status as Project['status'],
      lastEdited: updated.lastEdited || undefined,
      editedBy: updated.editedBy || undefined,
    };
  } catch (error) {
    console.error(`Database updateProject failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error(`Database deleteProject failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
