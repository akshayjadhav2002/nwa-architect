import { pgTable, text, integer, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';
import type { StudioProfile, TeamMember } from '../types.ts';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  year: integer('year').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  status: text('status').notNull().default('In Progress'),
  lastEdited: text('last_edited').default('Just now'),
  editedBy: text('edited_by').default('Admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  location: text('location').notNull(),
  status: text('status').notNull().default('Active'),
  postedDate: text('posted_date').notNull(),
  description: text('description').notNull(),
  requirements: jsonb('requirements').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const applications = pgTable('applications', {
  id: text('id').primaryKey(),
  candidateName: text('candidate_name').notNull(),
  position: text('position').notNull(),
  appliedDate: text('applied_date').notNull(),
  status: text('status').notNull().default('New'),
  email: text('email').notNull(),
  portfolioUrl: text('portfolio_url').default(''),
  avatarUrl: text('avatar_url'),
  experienceSummary: jsonb('experience_summary').$type<Array<{
    role: string;
    company: string;
    period: string;
    description?: string;
  }>>(),
  attachments: jsonb('attachments').$type<Array<{
    name: string;
    url: string;
    type: string;
  }>>(),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contactInquiries = pgTable('contact_inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  projectType: text('project_type').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studioSettings = pgTable('studio_settings', {
  id: text('id').primaryKey().default('default'),
  profile: jsonb('profile').$type<StudioProfile>().notNull(),
  team: jsonb('team').$type<TeamMember[]>().notNull(),
  security: jsonb('security').$type<{
    twoFactorEnabled: boolean;
  }>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
