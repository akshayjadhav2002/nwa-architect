import { db } from './index.ts';
import { contactInquiries } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { ContactInquiry } from '../types.ts';

export async function getAllInquiries(): Promise<ContactInquiry[]> {
  try {
    const rows = await db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone || '',
      projectType: r.projectType,
      message: r.message,
      status: (r.status as 'New' | 'Contacted') || 'New',
      createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Database getAllInquiries failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getInquiryById(id: string): Promise<ContactInquiry | null> {
  try {
    const [row] = await db.select().from(contactInquiries).where(eq(contactInquiries.id, id));
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      projectType: row.projectType,
      message: row.message,
      status: (row.status as 'New' | 'Contacted') || 'New',
      createdAt: row.createdAt ? row.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error(`Database getInquiryById failed for ${id}:`, error);
    return null;
  }
}

export interface CreateInquiryInput {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  message: string;
  status?: 'New' | 'Contacted';
  createdAt?: string;
}

export async function createInquiry(inquiryData: CreateInquiryInput): Promise<ContactInquiry> {
  try {
    const id = inquiryData.id || `inq-${Date.now()}`;
    const [inserted] = await db.insert(contactInquiries).values({
      id,
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone || '',
      projectType: inquiryData.projectType,
      message: inquiryData.message,
      status: inquiryData.status || 'New',
    }).returning();

    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      phone: inserted.phone || '',
      projectType: inserted.projectType,
      message: inserted.message,
      status: (inserted.status as 'New' | 'Contacted') || 'New',
      createdAt: inserted.createdAt ? inserted.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Database createInquiry failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateInquiry(id: string, data: Partial<ContactInquiry>): Promise<ContactInquiry | null> {
  try {
    const updateValues: Record<string, any> = {};
    if (data.name !== undefined) updateValues.name = data.name;
    if (data.email !== undefined) updateValues.email = data.email;
    if (data.phone !== undefined) updateValues.phone = data.phone;
    if (data.projectType !== undefined) updateValues.projectType = data.projectType;
    if (data.message !== undefined) updateValues.message = data.message;
    if (data.status !== undefined) updateValues.status = data.status;

    const [updated] = await db
      .update(contactInquiries)
      .set(updateValues)
      .where(eq(contactInquiries.id, id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || '',
      projectType: updated.projectType,
      message: updated.message,
      status: (updated.status as 'New' | 'Contacted') || 'New',
      createdAt: updated.createdAt ? updated.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error(`Database updateInquiry failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteInquiry(id: string): Promise<boolean> {
  try {
    const result = await db.delete(contactInquiries).where(eq(contactInquiries.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    console.error(`Database deleteInquiry failed for ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
