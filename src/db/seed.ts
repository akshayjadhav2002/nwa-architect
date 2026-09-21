import { db } from './index.ts';
import { projects, jobs, applications, contactInquiries, studioSettings } from './schema.ts';
import { seedProjects, seedJobs, seedApplications, seedInquiries, defaultSettings } from './seedData.ts';

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Projects
    const existingProjects = await db.select().from(projects);
    if (existingProjects.length === 0) {
      console.log('Seeding initial projects to PostgreSQL...');
      for (const p of seedProjects) {
        await db.insert(projects).values({
          id: p.id,
          title: p.title,
          category: p.category,
          location: p.location,
          year: p.year,
          description: p.description,
          imageUrl: p.imageUrl,
          status: p.status,
          lastEdited: p.lastEdited || 'Just now',
          editedBy: p.editedBy || 'Admin',
        }).onConflictDoNothing();
      }
    }

    // 2. Jobs
    const existingJobs = await db.select().from(jobs);
    if (existingJobs.length === 0) {
      console.log('Seeding initial jobs to PostgreSQL...');
      for (const j of seedJobs) {
        await db.insert(jobs).values({
          id: j.id,
          title: j.title,
          department: j.department,
          location: j.location,
          status: j.status,
          postedDate: j.postedDate,
          description: j.description,
          requirements: j.requirements,
        }).onConflictDoNothing();
      }
    }

    // 3. Applications
    const existingApps = await db.select().from(applications);
    if (existingApps.length === 0) {
      console.log('Seeding initial applications to PostgreSQL...');
      for (const a of seedApplications) {
        await db.insert(applications).values({
          id: a.id,
          candidateName: a.candidateName,
          position: a.position,
          appliedDate: a.appliedDate,
          status: a.status,
          email: a.email,
          portfolioUrl: a.portfolioUrl,
          avatarUrl: a.avatarUrl || null,
          experienceSummary: a.experienceSummary,
          attachments: a.attachments,
          notes: a.notes || '',
        }).onConflictDoNothing();
      }
    }

    // 4. Contact Inquiries
    const existingInquiries = await db.select().from(contactInquiries);
    if (existingInquiries.length === 0) {
      console.log('Seeding initial contact inquiries to PostgreSQL...');
      for (const inq of seedInquiries) {
        await db.insert(contactInquiries).values({
          id: inq.id,
          name: inq.name,
          email: inq.email,
          projectType: inq.projectType,
          message: inq.message,
        }).onConflictDoNothing();
      }
    }

    // 5. Studio Settings
    const existingSettings = await db.select().from(studioSettings);
    if (existingSettings.length === 0) {
      console.log('Seeding initial studio settings to PostgreSQL...');
      await db.insert(studioSettings).values({
        id: 'default',
        profile: defaultSettings.profile,
        team: defaultSettings.team,
        security: defaultSettings.security,
      }).onConflictDoNothing();
    }

    console.log('Database initialization and seeding check completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
