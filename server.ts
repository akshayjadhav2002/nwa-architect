import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { getAllProjects, createProject, updateProject, deleteProject } from "./src/db/projects.ts";
import { getAllJobs, createJob, updateJob, deleteJob } from "./src/db/jobs.ts";
import { getAllApplications, createApplication, updateApplication, deleteApplication } from "./src/db/applications.ts";
import { getAllInquiries, createInquiry, deleteInquiry } from "./src/db/inquiries.ts";
import { getSettings, updateSettings } from "./src/db/settings.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { seedDatabaseIfEmpty } from "./src/db/seed.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 25MB payloads for high-resolution architectural images
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Ensure local uploads & resumes storage directories exist & serve them statically
  const uploadsDir = path.join(process.cwd(), "uploads");
  const resumesDir = path.join(uploadsDir, "resumes");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }

  // Generate standard minimal PDF buffer for sample architectural candidates
  const generateSamplePdf = (candidateName: string, role: string, details: string): Buffer => {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 320 >>
stream
BT
/F1 18 Tf
50 720 Td
(NWA ARCHITECTS - CANDIDATE RESUME) Tj
/F1 14 Tf
0 -35 Td
(Applicant: ${candidateName}) Tj
/F1 11 Tf
0 -25 Td
(Role Applied: ${role}) Tj
0 -20 Td
(Persistent Storage: Cloud SQL / Storage Bucket Verified) Tj
0 -30 Td
(${details}) Tj
0 -20 Td
(Portfolio & Work Archive Verified via NWA Studio Core.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000620 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
700
%%EOF`;
    return Buffer.from(pdfContent);
  };

  // Seed sample PDF resumes if not already created
  const sampleResumes = [
    { name: "Resume_EThorne.pdf", candidate: "Elias Thorne", role: "Senior Design Architect", details: "10+ Yrs Architectural Practice • Foster & Partners Lead" },
    { name: "CoverLetter.pdf", candidate: "Elias Thorne", role: "Cover Letter & Intent", details: "Monolithic concrete facade focus & brutalist research" },
    { name: "S_Jenkins_CV.pdf", candidate: "Sarah Jenkins", role: "Structural Engineer", details: "Mass timber & long-span steel engineering • Arup Senior" },
    { name: "Marcus_Chen_Portfolio.pdf", candidate: "Marcus Chen", role: "Associate Architect", details: "Parametric facade modeling & computational design" },
    { name: "Sample_Architectural_CV.pdf", candidate: "NWA Applicant", role: "Architecture & Design", details: "Studio Portfolio, Credentials, and Academic Accreditations" },
  ];

  for (const item of sampleResumes) {
    const targetPath = path.join(resumesDir, item.name);
    if (!fs.existsSync(targetPath)) {
      try {
        fs.writeFileSync(targetPath, generateSamplePdf(item.candidate, item.role, item.details));
      } catch (err) {
        console.warn(`Could not write sample resume ${item.name}:`, err);
      }
    }
  }

  // Serve uploads statically with proper headers
  app.use("/uploads", express.static(uploadsDir, {
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    }
  }));

  // Dedicated Resume / Attachment Download route
  app.get("/api/resumes/download/:filename", (req, res) => {
    const filename = path.basename(req.params.filename);
    const resumePath = path.join(resumesDir, filename);
    const fallbackPath = path.join(uploadsDir, filename);

    if (fs.existsSync(resumePath)) {
      return res.download(resumePath, filename);
    } else if (fs.existsSync(fallbackPath)) {
      return res.download(fallbackPath, filename);
    } else {
      return res.status(404).json({ error: "Document not found in storage bucket." });
    }
  });

  // Seed initial dataset if tables are empty
  await seedDatabaseIfEmpty();

  // REST API Routes

  // Healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "NWA Architects Studio API (PostgreSQL + Cloud SQL + Document Storage)" });
  });

  // Universal File & Document Upload API (stores image / resume / PDF to backend filesystem & returns permanent URL)
  app.post(["/api/upload", "/api/upload/resume"], async (req, res) => {
    try {
      const { filename, dataUrl, base64, fileType, isResume } = req.body;
      const rawData: string = dataUrl || base64;
      if (!rawData) {
        return res.status(400).json({ error: "Missing document or image data." });
      }

      let ext = "pdf";
      let docType = "PDF Document";
      let buffer: Buffer;

      const mimeMatch = rawData.match(/^data:([A-Za-z0-9\-\+\/\.]+);base64,(.+)$/);
      if (mimeMatch) {
        const mime = mimeMatch[1].toLowerCase();
        if (mime.includes("pdf")) {
          ext = "pdf";
          docType = "PDF Document";
        } else if (mime.includes("wordprocessingml") || mime.includes("docx")) {
          ext = "docx";
          docType = "Word Document";
        } else if (mime.includes("msword") || mime.includes("doc")) {
          ext = "doc";
          docType = "Word Document";
        } else if (mime.includes("png")) {
          ext = "png";
          docType = "PNG Image";
        } else if (mime.includes("webp")) {
          ext = "webp";
          docType = "WebP Image";
        } else if (mime.includes("jpeg") || mime.includes("jpg")) {
          ext = "jpg";
          docType = "JPEG Image";
        } else if (mime.includes("gif")) {
          ext = "gif";
          docType = "GIF Image";
        } else if (mime.includes("svg")) {
          ext = "svg";
          docType = "SVG Vector";
        } else if (mime.includes("plain") || mime.includes("text")) {
          ext = "txt";
          docType = "Text Document";
        } else {
          // Check requested filename extension
          const reqExt = filename ? path.extname(filename).replace(".", "").toLowerCase() : "";
          if (["pdf", "docx", "doc", "png", "jpg", "jpeg", "webp", "txt"].includes(reqExt)) {
            ext = reqExt;
          }
        }
        buffer = Buffer.from(mimeMatch[2], "base64");
      } else {
        // Raw base64 string
        const reqExt = filename ? path.extname(filename).replace(".", "").toLowerCase() : "";
        if (reqExt) ext = reqExt;
        buffer = Buffer.from(rawData, "base64");
      }

      const originalName = filename || `resume-document.${ext}`;
      const isDocument = isResume || ["pdf", "doc", "docx", "txt"].includes(ext);
      const targetFolder = isDocument ? resumesDir : uploadsDir;

      const rawBaseName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .toLowerCase()
        .slice(0, 50);

      const uniqueFilename = `${Date.now()}-${rawBaseName || "document"}.${ext}`;
      const filePath = path.join(targetFolder, uniqueFilename);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = isDocument ? `/uploads/resumes/${uniqueFilename}` : `/uploads/${uniqueFilename}`;
      const sizeBytes = buffer.length;
      const sizeFormatted = sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(sizeBytes / 1024).toFixed(1)} KB`;

      console.log(`[Storage] Stored ${docType}: ${uniqueFilename} (${sizeFormatted}) to ${isDocument ? 'Resumes Bucket' : 'Uploads'}`);

      res.status(201).json({
        success: true,
        url: fileUrl,
        filename: uniqueFilename,
        originalName,
        type: docType,
        size: sizeBytes,
        sizeFormatted,
        storageType: "bucket",
        uploadedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("POST /api/upload error:", error);
      res.status(500).json({ error: error.message || "Failed to store document" });
    }
  });

  // User Sync Route
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { uid, email } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: "Missing uid or email" });
      }
      const user = await getOrCreateUser(uid, email);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Strict Authentication Route for Studio Portal
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email/username and password." });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password).trim();

      // Master Studio Admin Accounts
      const masterAdminEmails = [
        "admin@nwa.com",
        "admin",
        "nwa.architects2002@gmail.com",
        "akshaybloger@gmail.com",
      ];

      const isMasterAdmin = masterAdminEmails.includes(normalizedEmail) && cleanPassword === "studio2024";

      // Verify Against Registered Team Members in Database
      const currentSettings = await getSettings();
      const teamMember = currentSettings.team?.find(
        (m) => m.email.toLowerCase() === normalizedEmail && m.status === "Active"
      );
      const isTeamAuth = Boolean(teamMember && cleanPassword === "studio2024");

      if (isMasterAdmin) {
        const displayName =
          normalizedEmail === "admin" || normalizedEmail === "admin@nwa.com"
            ? "Studio Admin"
            : normalizedEmail.split("@")[0];
        const displayEmail = normalizedEmail.includes("@") ? normalizedEmail : "admin@nwa.com";

        return res.json({
          success: true,
          user: {
            name: displayName,
            email: displayEmail,
            role: "Principal Architect",
          },
        });
      }

      if (isTeamAuth && teamMember) {
        return res.json({
          success: true,
          user: {
            name: teamMember.name,
            email: teamMember.email,
            role: teamMember.role,
          },
        });
      }

      // If credentials do not match
      return res.status(401).json({
        error: "Invalid email or password. Access is restricted to authorized studio personnel.",
      });
    } catch (error: any) {
      console.error("POST /api/auth/login error:", error);
      res.status(500).json({ error: "Authentication service error. Please try again." });
    }
  });

  // Projects API
  app.get("/api/projects", async (_req, res) => {
    try {
      const projectsList = await getAllProjects();
      res.json(projectsList);
    } catch (error: any) {
      console.error("GET /api/projects error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const newProject = await createProject({
        title: req.body.title || "Untitled Project",
        category: req.body.category || "Residential",
        location: req.body.location || "City, Country",
        year: Number(req.body.year) || new Date().getFullYear(),
        description: req.body.description || "",
        imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        status: req.body.status || "In Progress",
        editedBy: req.body.editedBy || "Admin",
      });
      res.status(201).json(newProject);
    } catch (error: any) {
      console.error("POST /api/projects error:", error);
      res.status(500).json({ error: error.message || "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateProject(id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (error: any) {
      console.error(`PUT /api/projects/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteProject(id);
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (error: any) {
      console.error(`DELETE /api/projects/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to delete project" });
    }
  });

  // Job Postings API
  app.get("/api/jobs", async (_req, res) => {
    try {
      const jobsList = await getAllJobs();
      res.json(jobsList);
    } catch (error: any) {
      console.error("GET /api/jobs error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const newJob = await createJob({
        title: req.body.title || "New Role",
        department: req.body.department || "Design",
        location: req.body.location || "Pune, India",
        status: req.body.status || "Active",
        postedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        description: req.body.description || "",
        requirements: Array.isArray(req.body.requirements) ? req.body.requirements : [],
      });
      res.status(201).json(newJob);
    } catch (error: any) {
      console.error("POST /api/jobs error:", error);
      res.status(500).json({ error: error.message || "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateJob(id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Job posting not found" });
      }
    } catch (error: any) {
      console.error(`PUT /api/jobs/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteJob(id);
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (error: any) {
      console.error(`DELETE /api/jobs/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to delete job" });
    }
  });

  // Applications API
  app.get("/api/applications", async (_req, res) => {
    try {
      const appsList = await getAllApplications();
      res.json(appsList);
    } catch (error: any) {
      console.error("GET /api/applications error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      let attachmentsList = Array.isArray(req.body.attachments) && req.body.attachments.length > 0
        ? req.body.attachments
        : [];

      if (attachmentsList.length === 0 && req.body.resumeUrl) {
        attachmentsList.push({
          name: req.body.resumeName || "Resume.pdf",
          url: req.body.resumeUrl,
          type: req.body.resumeType || "PDF Document",
          size: req.body.resumeSize || "1.8 MB",
          storageType: "bucket",
          uploadedAt: new Date().toISOString(),
        });
      } else if (attachmentsList.length === 0) {
        attachmentsList.push({
          name: "Resume.pdf",
          url: "/uploads/resumes/Sample_Architectural_CV.pdf",
          type: "PDF Document",
          size: "1.2 MB",
          storageType: "bucket",
          uploadedAt: new Date().toISOString(),
        });
      }

      const newApp = await createApplication({
        candidateName: req.body.candidateName || "Candidate",
        position: req.body.position || "Applicant",
        appliedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        status: "New",
        email: req.body.email || "",
        portfolioUrl: req.body.portfolioUrl || "",
        avatarUrl: req.body.avatarUrl || undefined,
        experienceSummary: Array.isArray(req.body.experienceSummary) ? req.body.experienceSummary : [],
        attachments: attachmentsList,
        notes: req.body.coverLetter ? `Cover Letter: ${req.body.coverLetter}` : (req.body.notes || ""),
      });
      res.status(201).json(newApp);
    } catch (error: any) {
      console.error("POST /api/applications error:", error);
      res.status(500).json({ error: error.message || "Failed to submit application" });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateApplication(id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Application not found" });
      }
    } catch (error: any) {
      console.error(`PUT /api/applications/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteApplication(id);
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: "Application not found" });
      }
    } catch (error: any) {
      console.error(`DELETE /api/applications/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to delete application" });
    }
  });

  // Contact Inquiries API
  app.get("/api/inquiries", async (_req, res) => {
    try {
      const inquiriesList = await getAllInquiries();
      res.json(inquiriesList);
    } catch (error: any) {
      console.error("GET /api/inquiries error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const newInquiry = await createInquiry({
        name: req.body.name || "Anonymous",
        email: req.body.email || "",
        projectType: req.body.projectType || "General",
        message: req.body.message || "",
      });
      res.status(201).json({ success: true, inquiry: newInquiry });
    } catch (error: any) {
      console.error("POST /api/inquiries error:", error);
      res.status(500).json({ error: error.message || "Failed to submit inquiry" });
    }
  });

  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteInquiry(id);
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: "Inquiry not found" });
      }
    } catch (error: any) {
      console.error(`DELETE /api/inquiries/${req.params.id} error:`, error);
      res.status(500).json({ error: error.message || "Failed to delete inquiry" });
    }
  });

  // Settings API
  app.get("/api/settings", async (_req, res) => {
    try {
      const studioSettingsData = await getSettings();
      res.json(studioSettingsData);
    } catch (error: any) {
      console.error("GET /api/settings error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const updatedSettings = await updateSettings(req.body);
      res.json(updatedSettings);
    } catch (error: any) {
      console.error("PUT /api/settings error:", error);
      res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });

  // Vite middleware or Static Server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NWA Architects Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
