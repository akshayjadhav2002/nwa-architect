# NWA Architects — cPanel Deployment Guide

This guide walks you through deploying the full-stack **NWA Architects Studio** application (React frontend + Node.js Express backend + PostgreSQL database) on **cPanel** using the built-in **"Setup Node.js App"** tool (Phusion Passenger) or standard cPanel hosting.

---

## Prerequisites Checklist

1. **cPanel Account** with **"Setup Node.js App"** enabled (available on most modern hosting providers like Hostinger, Namecheap, GoDaddy, A2 Hosting, cPanel Cloud, etc.).
2. **PostgreSQL Database** (either from cPanel's **PostgreSQL Database Wizard** or an external free/managed database like Supabase, Neon, Aiven, or Cloud SQL).
3. **Node.js 18.x or 20.x+** on your hosting server.
4. **Domain / Subdomain** configured in cPanel (e.g. `nwaarchitects.com` or `app.nwaarchitects.com`).

---

## Step 1: Build the Application Locally / in AI Studio

Before uploading, compile the production assets (Vite frontend + Express backend bundle):

```bash
npm run build
```

This generates:
- `dist/` directory containing:
  - Static HTML/CSS/JS frontend files (`index.html`, assets, images)
  - `dist/server.cjs` (the standalone bundled Node.js Express server)

---

## Step 2: Set Up the PostgreSQL Database in cPanel

### Option A: Using cPanel's Built-in PostgreSQL
1. Log into your **cPanel Dashboard**.
2. Go to **Databases** > **PostgreSQL Databases** (or **PostgreSQL Database Wizard**).
3. **Create Database**: e.g., `youruser_nwa_db`.
4. **Create Database User**: e.g., `youruser_nwa_admin` with a strong password.
5. **Assign User to Database**: Grant **ALL PRIVILEGES**.
6. Note down:
   - Database Host: `localhost` (or `127.0.0.1`)
   - Database Port: `5432`
   - Database Name: `youruser_nwa_db`
   - Username: `youruser_nwa_admin`
   - Password: `your_password`

### Option B: Using Remote PostgreSQL (Supabase / Neon / Cloud SQL)
If your cPanel provider does not offer PostgreSQL, create a free database on [Supabase](https://supabase.com) or [Neon](https://neon.tech), and obtain your connection URL:
`postgresql://user:password@ep-host.region.neon.tech/neondb?sslmode=require`

---

## Step 3: Create the Node.js Application in cPanel

1. In cPanel, find **Software** > **Setup Node.js App** (CloudLinux / Phusion Passenger).
2. Click **Create Application**.
3. Fill in the fields:
   - **Node.js version**: Select `20.x` or `18.x`.
   - **Application mode**: `Production`.
   - **Application root**: `nwa-app` (or folder path where code will reside, e.g., `/home/username/nwa-app`).
   - **Application URL**: Select your domain or subdomain (e.g., `nwaarchitects.com`).
   - **Application startup file**: `dist/server.cjs` (or `app.js` wrapper if required by your host).
4. Click **Create**.
5. Once created, cPanel will show a command to enter the virtual environment:
   ```bash
   source /home/username/nodevenv/nwa-app/20/bin/activate && cd /home/username/nwa-app
   ```

---

## Step 4: Upload Project Files to cPanel

Using cPanel **File Manager** or **FTP (FileZilla)**:

1. Navigate to your application root directory (`/home/username/nwa-app`).
2. Upload the following files and folders:
   - `dist/` (contains `index.html`, static assets, and `server.cjs`)
   - `package.json`
   - `uploads/` (create empty directory with write permissions `755` for project images & resumes)
   - `.env` (environment variables file)

*(You do **not** need to upload `node_modules` or `src/` because `npm run build` bundles everything into `dist/`)*

---

## Step 5: Configure `.env` Environment Variables

In cPanel File Manager, create or edit the `.env` file inside `/home/username/nwa-app/`:

```env
NODE_ENV=production
PORT=3000

# Database Connection (PostgreSQL)
# Either full connection string:
DATABASE_URL="postgresql://youruser_nwa_admin:your_password@localhost:5432/youruser_nwa_db"

# Or standard PostgreSQL environment variables:
PGHOST="localhost"
PGPORT=5432
PGUSER="youruser_nwa_admin"
PGPASSWORD="your_password"
PGDATABASE="youruser_nwa_db"

# Application URL
APP_URL="https://nwaarchitects.com"

# Automated Email Notifications for Inquiries
INQUIRY_NOTIFICATION_EMAIL="nwa.architects2002@gmail.com"

# SMTP Settings for Live Email Sending (Gmail App Password or cPanel Webmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="nwa.architects2002@gmail.com"
SMTP_PASS="your-16-character-gmail-app-password"

# Optional Cloud Storage (Vercel Blob) if not using local disk /uploads
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

---

## Step 6: Install Production Dependencies

In cPanel **Setup Node.js App**:
1. Click on your application.
2. Under **Detected configuration files**, click **Run NPM Install** (or run `npm install --production` in cPanel Terminal / SSH).
3. The server will install required runtime packages (`express`, `pg`, `drizzle-orm`, `nodemailer`, `dotenv`, etc.).

---

## Step 7: Initialize / Seed Database Tables

When the application starts for the first time, `server.ts` automatically runs `seedDatabaseIfEmpty()`, which creates initial records and syncs the schema.

To run migrations manually using Drizzle Kit (via SSH or cPanel Terminal):
```bash
npx drizzle-kit push
```

---

## Step 8: Configure `.htaccess` for Port Proxy & Routing

cPanel automatically manages proxying requests from port 80/443 to your Node.js application. If you need manual `.htaccess` configuration in `public_html/` or your application root, use:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/username/nwa-app"
PassengerBaseURI "/"
PassengerNodejs "/home/username/nodevenv/nwa-app/20/bin/node"
PassengerAppType node
PassengerStartupFile "dist/server.cjs"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Step 9: Restart and Verify Application

1. In cPanel **Setup Node.js App**, click **Restart**.
2. Visit your domain: `https://nwaarchitects.com`
3. Verify:
   - [x] Home page and architectural gallery loads with images.
   - [x] Click **Admin** (lock icon) and log in with studio credentials (`admin@nwa.com` / `studio2024` or synced Firebase).
   - [x] Test submitting a test inquiry on the Contact page:
     - Check that inquiry appears in Admin Portal under **Client Inquiries** with the **NEW** tag.
     - Check email inbox `nwa.architects2002@gmail.com` for the automated notification email.
   - [x] Test marking inquiry as **Contacted**.

---

## Summary Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **503 Service Unavailable** | Node.js app is stopped or crashed | Check cPanel Node.js error log (`stderr.log` in app folder). Verify database credentials in `.env`. |
| **Database Connection Error** | PostgreSQL credentials incorrect or host not accessible | Ensure database user has all privileges on the database and host is `localhost` or SSL enabled. |
| **Image / Resume Uploads fail** | Missing write permissions on `uploads/` | In cPanel File Manager, right-click `uploads/` folder -> Change Permissions -> set to `755` or `775`. |
| **Emails not sending** | Invalid SMTP credentials | Generate a 16-character **Google App Password** at `myaccount.google.com/apppasswords` and add to `SMTP_PASS` in `.env`. |
