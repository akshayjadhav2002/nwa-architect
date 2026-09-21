import { db } from './index.ts';
import { studioSettings } from './schema.ts';
import { eq } from 'drizzle-orm';
import { StudioSettings } from '../types.ts';
import { defaultSettings } from './seedData.ts';

export async function getSettings(): Promise<StudioSettings> {
  try {
    const rows = await db.select().from(studioSettings).where(eq(studioSettings.id, 'default'));
    if (rows.length > 0) {
      return {
        profile: rows[0].profile,
        team: rows[0].team,
        security: rows[0].security,
      };
    }

    // If not seeded yet, insert default
    const [inserted] = await db.insert(studioSettings).values({
      id: 'default',
      profile: defaultSettings.profile,
      team: defaultSettings.team,
      security: defaultSettings.security,
    }).returning();

    return {
      profile: inserted.profile,
      team: inserted.team,
      security: inserted.security,
    };
  } catch (error) {
    console.error('Database getSettings failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateSettings(updates: Partial<StudioSettings>): Promise<StudioSettings> {
  try {
    const current = await getSettings();
    const newSettings: StudioSettings = {
      profile: updates.profile ? { ...current.profile, ...updates.profile } : current.profile,
      team: updates.team ? updates.team : current.team,
      security: updates.security ? { ...current.security, ...updates.security } : current.security,
    };

    const [updated] = await db.insert(studioSettings)
      .values({
        id: 'default',
        profile: newSettings.profile,
        team: newSettings.team,
        security: newSettings.security,
      })
      .onConflictDoUpdate({
        target: studioSettings.id,
        set: {
          profile: newSettings.profile,
          team: newSettings.team,
          security: newSettings.security,
          updatedAt: new Date(),
        },
      })
      .returning();

    return {
      profile: updated.profile,
      team: updated.team,
      security: updated.security,
    };
  } catch (error) {
    console.error('Database updateSettings failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
