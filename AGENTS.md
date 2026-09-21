# Project Instructions & Agent Guidelines

## 1. Living Technical Documentation
- **Mandatory Requirement**: Maintain `TECHNICAL_DOCUMENTATION.md` in the project root on every turn whenever a feature is added, modified, or reconfigured.
- Update relevant sections including:
  - System Overview & Architecture
  - Database Schema (`src/db/schema.ts` / Drizzle ORM)
  - API Routes and Handlers (`server.ts`)
  - State Management & Component Hierarchy
  - Change Log & Feature Summary

## 2. Technical Stack Constraints
- **Backend**: Express on port `3000` with TypeScript (`server.ts`).
- **Database**: Cloud SQL PostgreSQL (`asia-southeast1`) with Drizzle ORM.
- **Authentication**: Firebase Auth (Google OAuth & Studio credentials) synced to PostgreSQL and session storage.
- **Frontend**: React 18, Tailwind CSS, Lucide icons, Material Symbols.
