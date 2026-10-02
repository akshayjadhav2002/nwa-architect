# NWA Architects Studio — Technical Documentation

## 1. System Overview

**NWA Architects Studio** is a full-stack architectural portfolio and executive administration portal. It bridges a high-aesthetic client-facing architectural portfolio with a real-time administrative management suite for managing architectural commissions, recruitment pipelines, applicant tracking, client inquiries, and studio operational parameters.

- **Frontend**: React 18 with TypeScript, Tailwind CSS, Lucide Icons, and Google Material Symbols.
- **Backend**: Node.js Express server with TypeScript (`server.ts`).
- **Database**: Cloud SQL PostgreSQL (`asia-southeast1`) managed via Drizzle ORM.
- **Authentication**: Firebase Authentication (Google OAuth) + Studio Credential verification with session synchronization.
- **Build System**: Vite (client-side bundling) + esbuild (server-side CommonJS bundle compilation).

---

## 2. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  ┌─────────────────────────┐   ┌──────────────────────────┐ │
│  │    Public Portfolio     │   │   Executive Admin Suite  │ │
│  │  - Projects Showcase    │   │  - Analytics Dashboard   │ │
│  │  - Studio Philosophy    │   │  - Project CRUD          │ │
│  │  - Career Opportunities │   │  - Job Pipeline Manager  │ │
│  │  - Application Form     │   │  - Applicant Reviewer    │ │
│  │  - Contact Inquiries    │   │  - Studio Settings       │ │
│  └────────────┬────────────┘   └────────────┬─────────────┘ │
└───────────────┼─────────────────────────────┼───────────────┘
                │ HTTP REST / JSON            │
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express Application Server                  │
│                        (server.ts)                          │
│  - Middleware: CORS, JSON Body Parser                       │
│  - API Routes: /api/projects, /api/jobs, /api/applications, │
│                /api/inquiries, /api/settings, /api/auth     │
│  - Seed Initializer: seedDatabaseIfEmpty()                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Drizzle ORM / pg.Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloud SQL PostgreSQL Database                  │
│                    (asia-southeast1)                        │
│  - projects            - jobs                               │
│  - applications        - contact_inquiries                  │
│  - studio_settings     - users                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Specification

Database schema is defined using Drizzle ORM in `src/db/schema.ts` targeting PostgreSQL:

### 3.1. `projects`
Stores architectural works exhibited on the portfolio and managed via Admin.
- `id` (`text`, Primary Key): Unique project slug/identifier (e.g., `proj-1`).
- `title` (`text`, Not Null): Display title of the project.
- `category` (`text`, Not Null): Category (`Commercial`, `Residential`, `Cultural`, `Healthcare`, `Office`).
- `location` (`text`, Not Null): Geographical location (e.g., `Pune, India`, `Kyoto, Japan`).
- `year` (`integer`, Not Null): Project year.
- `description` (`text`, Not Null): Architectural concept and design rationale.
- `image_url` (`text`, Not Null): High-resolution hero image URL.
- `status` (`text`, Default: `'In Progress'`): Status (`In Progress`, `Completed`, `Concept Phase`).
- `last_edited` (`text`): Relative or absolute timestamp of last modification.
- `edited_by` (`text`): Name/ID of administrator who last modified the entry.
- `created_at` (`timestamp`, Default: `NOW()`): Record creation timestamp.

### 3.2. `jobs`
Stores career openings and recruitment postings.
- `id` (`text`, Primary Key): Unique job identifier (e.g., `job-1`).
- `title` (`text`, Not Null): Role title (e.g., `Senior Design Architect`).
- `department` (`text`, Not Null): Department (`Design`, `Architecture`, `Interior Design`, `Interiors`, `Management`, `Engineering`).
- `location` (`text`, Not Null): Studio office location.
- `status` (`text`, Default: `'Active'`): Listing status (`Active`, `Draft`, `Archived`).
- `posted_date` (`text`, Not Null): Date posted string.
- `description` (`text`, Not Null): Detailed job description.
- `requirements` (`jsonb`, Not Null): Array of string qualification points (`string[]`).
- `created_at` (`timestamp`, Default: `NOW()`): Record creation timestamp.

### 3.3. `applications`
Stores candidate applications submitted through the careers portal.
- `id` (`text`, Primary Key): Unique application ID (e.g., `app-1`).
- `candidate_name` (`text`, Not Null): Candidate's full name.
- `position` (`text`, Not Null): Position applied for.
- `applied_date` (`text`, Not Null): Date submission was received.
- `status` (`text`, Default: `'New'`): Review status (`New`, `Reviewing`, `Interviewing`, `Shortlisted`, `Offer Sent`, `Rejected`).
- `email` (`text`, Not Null): Candidate contact email.
- `phone` (`text`, Default: `''`): Candidate contact mobile/phone number.
- `portfolio_url` (`text`): Link to candidate portfolio/website.
- `avatar_url` (`text`): Optional profile picture URL.
- `experience_summary` (`jsonb`): Array of past experience objects `{ role, company, period, description }`.
- `attachments` (`jsonb`): Array of uploaded document references `{ name, url, type }`.
- `notes` (`text`): Internal reviewer evaluation notes.
- `created_at` (`timestamp`, Default: `NOW()`): Record creation timestamp.

### 3.4. `contact_inquiries`
Stores prospective client contact and commission inquiries.
- `id` (`text`, Primary Key): Inquiry identifier (e.g., `inq-1`).
- `name` (`text`, Not Null): Sender name.
- `email` (`text`, Not Null): Sender email address.
- `phone` (`text`, Default: `''`): Client mobile/phone number with country code.
- `project_type` (`text`, Not Null): Type of commission (`residential`, `commercial`, `cultural`, `hospitality`, `landscape`, `interior`, `other`).
- `message` (`text`, Not Null): Detailed inquiry message.
- `created_at` (`timestamp`, Default: `NOW()`): Timestamp received.

### 3.5. `studio_settings`
Stores singleton studio configuration and administrative parameters.
- `id` (`text`, Primary Key, Default: `'default'`): Singleton record ID.
- `profile` (`jsonb`, Not Null): `{ name, registrationNumber, hqAddress, contactEmail, phoneNumber, logoUrl }`.
- `team` (`jsonb`, Not Null): Array of `{ id, name, role, status, initials, email }`.
- `security` (`jsonb`, Not Null): `{ twoFactorEnabled: boolean }`.
- `updated_at` (`timestamp`, Default: `NOW()`): Timestamp of last settings update.

### 3.6. `users`
Tracks authenticated administrators synced from Firebase Authentication.
- `id` (`serial`, Primary Key): Integer primary key.
- `uid` (`text`, Not Null, Unique): Firebase User UID.
- `email` (`text`, Not Null): User email address.
- `created_at` (`timestamp`, Default: `NOW()`): Creation timestamp.

---

## 4. API Specification

All API endpoints return JSON and are hosted under the `/api` prefix on port 3000.

### 4.1. Media, Resume & Document Storage Endpoints
- `POST /api/upload`: Accepts base64 or dataUrl payloads up to 25MB for images and documents. When `isResume: true` or document extensions (`.pdf`, `.doc`, `.docx`) are detected, securely stores them in the persistent resume bucket filesystem `/uploads/resumes/` with sanitized timestamped filenames and returns `{ success: true, url: "/uploads/resumes/:filename", filename, sizeFormatted, type }`.
- `POST /api/upload/resume`: Dedicated document upload route that validates PDF, Word, and text documents, saves to the persistent bucket storage `/uploads/resumes/`, and returns rich metadata (`url`, `sizeFormatted`, `storageType: "bucket"`, `uploadedAt`).
- `GET /api/resumes/download/:filename`: Secure static download endpoint with `Content-Disposition: attachment` headers allowing administrators and studio reviewers to download candidate resumes and portfolios directly to local storage.
- `GET /uploads/resumes/:filename`: Direct static file serving route configured with `Content-Disposition: inline` for immediate in-app browser and iframe PDF previews.

### 4.2. Projects Endpoints
- `GET /api/projects`: Retrieve all projects ordered by newest creation date.
- `POST /api/projects`: Create a new project record.
- `PUT /api/projects/:id`: Update an existing project record by ID.
- `DELETE /api/projects/:id`: Delete a project record by ID.

### 4.3. Jobs Endpoints
- `GET /api/jobs`: Retrieve all job postings.
- `POST /api/jobs`: Create a new job posting.
- `PUT /api/jobs/:id`: Update an existing job posting by ID.
- `DELETE /api/jobs/:id`: Delete a job posting by ID.

### 4.4. Applications Endpoints
- `GET /api/applications`: Retrieve all applicant submissions.
- `POST /api/applications`: Submit a new candidate application.
- `PUT /api/applications/:id`: Update applicant review status or internal notes.
- `DELETE /api/applications/:id`: Delete an application record.

### 4.4. Contact Inquiries Endpoints
- `GET /api/inquiries`: Retrieve all prospective client inquiries.
- `POST /api/inquiries`: Submit a new inquiry from the contact form.
- `DELETE /api/inquiries/:id`: Delete an inquiry record.

### 4.5. Studio Settings Endpoints
- `GET /api/settings`: Retrieve the studio profile, team roster, and security settings.
- `PUT /api/settings`: Update studio profile details, add/remove team members, or toggle security options.

### 4.6. Auth Sync Endpoints
- `POST /api/auth/sync`: Synchronizes a Firebase authenticated user to the PostgreSQL `users` table.

---

## 5. Authentication & State Management

1. **Authentication Providers**:
   - **Google Sign-In**: Integrated using Firebase Authentication (`signInWithPopup` via `googleAuthProvider`).
   - **Studio Credentials**: Verified against studio administrative records with instant validation for studio personnel.
2. **Session Persistence**:
   - Firebase Auth state listener (`onAuthStateChanged`) monitors the active session.
   - User identity (`name`, `email`) is synchronized to `sessionStorage` (`nwa_admin_user_name`, `nwa_admin_user_email`, `nwa_admin_auth`).
3. **Dynamic User Display**:
   - The navigation sidebar footer dynamically renders the authenticated user's name/email and live status indicator rather than a static string.

---

## 6. Project Structure

```
├── server.ts                    # Express server entry point & API route handlers
├── metadata.json                # AI Studio application configuration
├── package.json                 # Project dependencies and execution scripts
├── TECHNICAL_DOCUMENTATION.md   # System architecture and technical reference
├── AGENTS.md                    # Persistent guidelines for coding agents
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Root state coordinator and router
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── lib/
│   │   ├── firebase.ts          # Client-side Firebase SDK configuration
│   │   └── firebase-admin.ts    # Server-side Firebase Admin SDK configuration
│   ├── middleware/
│   │   └── auth.ts              # Express Firebase token authentication middleware
│   ├── db/
│   │   ├── index.ts             # PostgreSQL connection pool (pg.Pool) & Drizzle instance
│   │   ├── schema.ts            # Drizzle ORM table definitions
│   │   ├── drizzle.config.ts    # Drizzle Kit CLI configuration
│   │   ├── seedData.ts          # Initial seed dataset definitions
│   │   ├── seed.ts              # Database auto-seeder utility
│   │   ├── projects.ts          # Projects DB repository helpers
│   │   ├── jobs.ts              # Jobs DB repository helpers
│   │   ├── applications.ts      # Applications DB repository helpers
│   │   ├── inquiries.ts         # Inquiries DB repository helpers
│   │   ├── settings.ts          # Studio settings DB repository helpers
│   │   └── users.ts             # User sync DB repository helpers
│   ├── components/
│   │   ├── TopNavBar.tsx        # Public website header navigation
│   │   ├── SideNavBar.tsx       # Admin sidebar with dynamic user identity
│   │   ├── AdminLoginModal.tsx  # Studio login dialog (Google & Studio auth)
│   │   ├── ProjectModal.tsx     # Project creation / edit modal
│   │   ├── JobModal.tsx         # Job opening creation / edit modal
│   │   ├── ApplicationModal.tsx # Public job application submission modal
│   │   ├── ApplicationDetailModal.tsx # Admin applicant dossier & evaluation
│   │   └── Toast.tsx            # Global notification toasts
│   └── views/
│       ├── public/
│       │   ├── PortfolioView.tsx# Hero slides, project gallery & filtering
│       │   ├── AboutView.tsx    # Studio philosophy, principals, timeline
│       │   ├── CareersView.tsx  # Open positions & job application triggers
│       │   └── ContactView.tsx  # Interactive contact form & office details
│       └── admin/
│           ├── AdminDashboard.tsx   # Executive metrics, bento cards & quick actions
│           ├── AdminProjects.tsx    # Project portfolio CRUD table & editor
│           ├── AdminJobs.tsx        # Recruitment pipeline & job postings manager
│           ├── AdminApplications.tsx # Candidate pipeline review board & dossiers
│           ├── AdminInquiries.tsx   # Website client inquiries viewer & responder
│           └── AdminSettings.tsx    # Studio profile, contact details & team manager
```

---

## 7. Change Log & Maintenance Protocol

### Recent Changes (2026-09-21)
- **Streamlined Candidate Application Form & UI Clutter Removal**:
  - Removed redundant "Previous Experience" multi-row input blocks and extra micro-badges from `ApplyModal.tsx` as requested by user.
  - Form now focuses cleanly on core candidate identification (Full Name, Email Address, Portfolio URL), streamlined file upload for Resume/CV (PDF, DOC, DOCX), and a spacious Cover Letter note area.
  - Retained full backend compatibility with existing candidate records and document storage bucket integration.

### Recent Changes (2026-09-08)
- **Persistent Resume Storage Bucket & Document Access Architecture**:
  - Implemented persistent filesystem storage bucket under `/uploads/resumes/` on the Express backend (`server.ts`).
  - Implemented `/api/upload/resume` and unified `/api/upload` document routes supporting PDF, DOC, DOCX, and TXT files up to 20MB.
  - Added `/api/resumes/download/:filename` endpoint for one-click downloading of candidate CVs and portfolios.
  - Updated `Application` model and Drizzle database attachments schema to track `size`, `type`, `storageType: "bucket"`, and `uploadedAt` metadata.
  - Enhanced `ApplyModal.tsx` with instant document encoding, upload progress indicators, persistent storage verification badges, and automatic metadata synchronization with Cloud SQL PostgreSQL.
  - Upgraded `AdminApplications.tsx` with rich attachment cards, file size badges, one-click resume download, and an in-app PDF document preview modal.
  - Seeded initial PDF resumes for existing candidate applications to ensure immediate end-to-end preview and download capability.

### Recent Changes (2026-09-07)
- **Modal Viewport Containment & Scroll Boundary Fix**:
  - Restructured `ApplyModal.tsx` and `AdminLoginModal.tsx` to prevent vertical overflow and clipping outside the screen/viewport.
  - Constrained dialog containers to `max-h-[92vh] sm:max-h-[88vh]` with a dedicated flex column architecture (`flex flex-col min-h-0 overflow-hidden`).
  - Added a sticky header with immediate close action, internal `overflow-y-auto` scrollable form body, and sticky action footer (`Submit Application` and `Cancel`), guaranteeing complete visibility across all viewport heights and screen resolutions.
- **Strict Authentication & Login Security Fix**:
  - Implemented `POST /api/auth/login` endpoint in `server.ts` to validate email/username and password against master studio administrator accounts and registered active team members in Cloud SQL PostgreSQL.
  - Resolved loose client-side validation bug in `AdminLoginModal.tsx` that previously allowed arbitrary inputs containing `@` to bypass authentication.
  - Added instant invalid credential feedback, disabled entry on 401 unauthorized responses, and provided an explicit auto-fill helper for valid demo credentials (`admin@nwa.com` / `studio2024`).
- **Portfolio Archive Project Tile Layout & Action Buttons Fix**:
  - Restructured the project item card in `AdminProjects.tsx` with `min-w-0 flex-1` flex containment, text title truncation, and `shrink-0` action buttons with dedicated click/hover containers (`w-8 h-8`), preventing action buttons from overflowing or wrapping outside the tile borders.
- **Interactive Image Upload & Backend Storage Architecture**:
  - Implemented interactive file chooser window trigger (`useRef<HTMLInputElement>`) and drag-and-drop handler in `AdminProjects.tsx` for portfolio image uploads.
  - Added dedicated `/api/upload` endpoint in `server.ts` with 25MB payload limits, saving uploaded files to persistent `/uploads` backend server storage and serving them statically at `/uploads/:filename`.
  - Linked uploaded images directly to Cloud SQL PostgreSQL `projects.image_url` column with instant preview, image replacement, clear controls, and offline fallback.
- **Universal Confirmation Modal System**:
  - Implemented reusable `ConfirmationModal.tsx` with architectural styling, keyboard `Escape` listeners, click-outside dismissal, and clear contextual item details.
  - Integrated deletion confirmation dialogs across the entire application:
    - **Job Postings (`AdminJobs.tsx`)**: Confirmation modal before deleting any recruitment role or job posting.
    - **Portfolio Projects (`AdminProjects.tsx`)**: Confirmation modal before deleting any architectural project from the archive.
    - **Team Members (`AdminSettings.tsx`)**: Confirmation modal before removing any team member or studio admin from access lists.
    - **Client Inquiries (`AdminInquiries.tsx`)**: Standardized on `ConfirmationModal` before permanently deleting client submissions.
- **Client Inquiry Deletion & Actions Fix**:
  - Replaced browser-native `window.confirm` dialogs with in-app confirmation modal dialogs, resolving sandboxed iframe blocking.
  - Added robust clipboard copy fallback mechanism for copying client email addresses across restricted iframe contexts.
- **Client Inquiries Management**:
  - Added dedicated `AdminInquiries.tsx` component to view, search, filter, copy emails, reply via mailto, and manage client inquiries submitted through the website contact form.
  - Updated `SideNavBar.tsx` to include an **Inquiries** tab item with a live unread/total count badge indicator.
  - Updated `AdminDashboard.tsx` with a dedicated **Client Inquiries** bento metric card and quick-action launcher.
  - Integrated `handleDeleteInquiry` with `DELETE /api/inquiries/:id` and PostgreSQL persistence.
- **Legacy Files Cleanup**:
  - Removed obsolete Python backend (`backend/main.py`) and legacy lockfiles (`bun.lock`).
  - Removed unused re-export alias (`src/views/StudioView.tsx`).
  - Migrated database seed constants from deleted `src/data/mockData.ts` to `src/db/seedData.ts`.
  - Decoupled `src/App.tsx` and `src/db/settings.ts` from mock datasets, making PostgreSQL the sole source of truth.
- **Contact Inquiry Mobile Number & Comprehensive Form Validations**:
  - Added `mobile` / `phone` number field to the General Inquiries form in `ContactView.tsx` with international phone formatting hints.
  - Implemented comprehensive field validation across all form inputs (Full Name, Email Address, Mobile Number, Project Category, and Message Brief) with real-time touched tracking and inline visual error feedback with warning icons.
  - Updated Cloud SQL PostgreSQL schema (`contact_inquiries.phone`), database repository helpers (`src/db/inquiries.ts`), and `server.ts` API route with backend validation rules.
  - Enhanced `AdminInquiries.tsx` to render client phone numbers in inquiry list cards, detail review panels with one-click copy and click-to-call (`tel:`) buttons, and mobile drawer actions.
- **Candidate Application Mobile Number & Form Validations**:
  - Added `phone` (Mobile Number) field to the candidate application form (`ApplyModal.tsx`) with international phone formatting hints.
  - Implemented field-level validation and touched tracking for all application inputs (Full Name, Email Address, Mobile Number, Portfolio URL, and Resume / CV upload) with inline feedback indicators.
  - Updated Cloud SQL PostgreSQL schema (`applications.phone`), types (`types.ts`), repository helpers (`src/db/applications.ts`), and `server.ts` API route (`POST /api/applications`) with backend validation and persistence.
  - Updated `AdminApplications.tsx` to display candidate phone numbers on applicant cards and detail header views with click-to-call (`tel:`) and one-click clipboard copy.
- **Vercel Blob Storage Integration for Resumes & Architectural Imagery**:
  - Integrated `@vercel/blob` SDK for persistent cloud object storage of candidate resumes (`resumes/[timestamp]-[filename].pdf`) and architectural project photography (`projects/[timestamp]-[filename].jpg`).
  - Created universal storage adapter `src/lib/blobStorage.ts` with automatic Vercel Blob cloud bucket dispatch when `BLOB_READ_WRITE_TOKEN` is present and seamless local disk fallback when running offline or locally.
  - Updated `AdminProjects.tsx` and `ApplyModal.tsx` upload pipelines to tag categories (`project` vs `resume`) and save public CDN URLs directly into database records.
  - Documented `BLOB_READ_WRITE_TOKEN` in `.env.example` and technical architecture specifications.
- **Admin Settings UI Simplification**:
  - Removed the Storage & Cloud infrastructure panel from Studio Settings (`AdminSettings.tsx`) to keep the administrative interface focused purely on Studio Profile, Team Management, and Account Security.
- **Dynamic Identity**:
  - Connected the navigation sidebar to display live authenticated user names and emails across session lifetimes.
- **Admin Dashboard & Form UI Refinements**:
  - Removed decorative numbered index prefixes from Recent Projects list rows in `AdminDashboard.tsx` for cleaner typography hierarchy.
  - Removed author subtitle tag (`by [Name]`) from Recent Projects row items in `AdminDashboard.tsx`, streamlining the list to display project status and last edited date.
  - Removed internal storage architecture info badge from `AdminProjects.tsx` media upload section to maintain a clean, distraction-free architectural editor interface.
- **Enhanced In-App Document & Resume Previewer**:
  - Fixed PDF generator byte offsets and xref tables in `server.ts` to output 100% standard-compliant PDF documents.
  - Upgraded `AdminApplications.tsx` document preview modal with a dual-mode viewer:
    - **Architectural Resume Sheet**: A clean, highly legible formatted CV view with candidate credentials, contact strip, experience timeline, and verification stamp (guaranteed 100% visible inside iframe sandboxes).
    - **Raw PDF / Embed**: Object and iframe rendering with fallbacks.
    - **Image Viewer**: High-definition image preview with interactive zoom controls (zoom in, zoom out, reset).
    - **Action Controls**: One-click "Open in New Tab" popout and "Download" buttons.

- **Automatic Blob & Local Storage File Deletion Lifecycle**:
  - Enhanced `server.ts` routes (`DELETE /api/projects/:id` and `DELETE /api/applications/:id`) to automatically resolve the target record and permanently delete associated image assets, resumes, and document attachments from Vercel Blob Storage and local `/uploads` storage directories upon deletion.
  - Implemented `getProjectById` in `src/db/projects.ts` and `getApplicationById` in `src/db/applications.ts` to look up asset paths prior to database row removal.
  - Enhanced `deleteFromStorage` in `src/lib/blobStorage.ts` to safely parse Vercel Blob storage URLs (`del(url)`), local filesystem paths (`/uploads/projects/*`, `/uploads/resumes/*`), and relative URLs, while ignoring external third-party placeholder URLs (e.g., Unsplash).
  - Added dedicated `POST /api/storage/delete` endpoint in `server.ts` and hooked up image clearance / removal actions in `AdminProjects.tsx` for immediate uncommitted asset cleanup.

- **Resume Direct "Open in New Tab" Action**:
  - Replaced the in-app document preview trigger button on candidate attachment cards in `AdminApplications.tsx` with a direct **"Open in New Tab"** action button.
  - Added safe URL/Blob object URI resolution to open both server `/uploads` documents, cloud storage bucket files, and base64 document attachments in a new browser tab.

- **Featured Projects Spotlight & Auto-Sliding Hero Carousel (Max 5 Projects)**:
  - Added `is_featured` (`boolean`, default: `false`) column to Cloud SQL PostgreSQL `projects` schema (`src/db/schema.ts`), TypeScript definitions (`types.ts`), and Drizzle repository layer (`src/db/projects.ts`).
  - Added a dedicated **"Feature this Project on Home Screen Carousel"** toggle card in `AdminProjects.tsx` with a live capacity counter (`Featured: X/5`) and validation preventing more than 5 featured projects from being active concurrently.
  - Implemented one-click featured star (`⭐`) quick-toggle action in the Portfolio Archive sidebar list in `AdminProjects.tsx`.
  - Connected `PortfolioView.tsx` to dynamically query active featured projects (up to 5) and project them directly into the auto-sliding Hero Carousel with smooth Framer Motion crossfade transitions (auto-sliding every 3.5s with pause on hover), real-time slide counter (`01 / 05 • Auto Sliding`), and one-click "Explore Project Details" modal trigger.
  - Preserved clean, uncluttered portfolio gallery aesthetic on the main page by keeping standard architectural category filtering (`All`, `Residential`, `Commercial`, `Cultural`, `Institutional`, `Healthcare`, `Office`) and seamless project tiles without intrusive badges.

- **Project Detail Image Color Fidelity**:
  - Removed the default grayscale filter effect from the project detail modal hero image (`ProjectDetailModal.tsx`) so architectural photographs and elevations render immediately in full original color fidelity when opened.

- **Automated Client Inquiry Email Notification System**:
  - Implemented dedicated email dispatch service `src/lib/mailService.ts` using `nodemailer`.
  - Integrated automatic email notification trigger inside `POST /api/inquiries` in `server.ts`.
  - When a user submits an inquiry on the website contact page, the system immediately sends a formatted email to `nwa.architects2002@gmail.com` containing:
    - Client Full Name, Email Address, and Phone/Mobile Number.
    - Project Category / Type.
    - Full client architectural brief/message with received timestamp.
    - Direct `Reply-To` header set to the client's email for single-click response from the studio inbox.
    - Clean architectural HTML email template with fallbacks for standard SMTP/Gmail App Passwords or graceful outbox logging.
  - Documented environment variables (`INQUIRY_NOTIFICATION_EMAIL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `SMTP_*`) in `.env.example`.

- **Admin Inquiries Badge Removal & Navigation Streamlining**:
  - Removed the numerical notification counter badge from the sidebar navigation item (`SideNavBar.tsx`) for Inquiries to provide a consistent, uniform layout with other menu items.
  - Removed the counter pill badge from the header title in `AdminInquiries.tsx` for cleaner typographical hierarchy.

- **Inquiry Status Lifecycle & "NEW" / "Contacted" Tagging**:
  - Added `status` (`text`, values: `'New' | 'Contacted'`, default: `'New'`) column to Cloud SQL PostgreSQL `contact_inquiries` schema (`src/db/schema.ts`), TypeScript definitions (`types.ts`), and Drizzle repository layer (`src/db/inquiries.ts`).
  - Added `PUT /api/inquiries/:id` endpoint in `server.ts` to persist status updates.
  - Implemented visual **"NEW"** badge indicators for fresh inquiries in `AdminInquiries.tsx`.
  - Added a dedicated **"Mark as Contacted"** action button in the inquiry detail panel (and mobile drawer) that instantly switches the status to `'Contacted'` and removes the "NEW" tag.
  - Automatic status transition to `'Contacted'` when clicking "Reply" (email) or "Call" (mobile).
  - Added status filter tabs (**All**, **New**, **Contacted**) in the inquiries list sidebar.

Whenever a new feature is implemented, a data model is altered, or a UI component is modified:
1. Update this `TECHNICAL_DOCUMENTATION.md` file reflecting the updated schema, routes, or component behavior.
2. Ensure database schema updates are reflected in `src/db/schema.ts` and repository helpers.
3. Keep `types.ts` strictly synchronized with all DB entities.
