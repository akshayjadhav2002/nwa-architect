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
      projectType: r.projectType,
      message: r.message,
      createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Database getAllInquiries failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export interface CreateInquiryInput {
  id?: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt?: string;
}

export async function createInquiry(inquiryData: CreateInquiryInput): Promise<ContactInquiry> {
  try {
    const id = inquiryData.id || `inq-${Date.now()}`;
    const [inserted] = await db.insert(contactInquiries).values({
      id,
      name: inquiryData.name,
      email: inquiryData.email,
      projectType: inquiryData.projectType,
      message: inquiryData.message,
    }).returning();

    return {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      projectType: inserted.projectType,
      message: inserted.message,
      createdAt: inserted.createdAt ? inserted.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Database createInquiry failed:', error);
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
