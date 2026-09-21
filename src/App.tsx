import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Project, JobPosting, Application, StudioSettings, ContactInquiry } from './types';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar, AdminView } from './components/SideNavBar';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';

// Views
import { PortfolioView } from './views/PortfolioView';
import { AboutView } from './views/AboutView';
import { CareersView } from './views/CareersView';
import { ContactView } from './views/ContactView';

// Admin Views
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminProjects } from './views/admin/AdminProjects';
import { AdminJobs } from './views/admin/AdminJobs';
import { AdminApplications } from './views/admin/AdminApplications';
import { AdminInquiries } from './views/admin/AdminInquiries';
import { AdminSettings } from './views/admin/AdminSettings';

type PublicTab = 'portfolio' | 'about' | 'studio' | 'careers' | 'contact';

export function App() {
  const [activeTab, setActiveTab] = useState<PublicTab>('portfolio');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nwa_admin_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(() => {
    const savedName = sessionStorage.getItem('nwa_admin_user_name');
    const savedEmail = sessionStorage.getItem('nwa_admin_user_email');
    if (savedName || savedEmail) {
      return { name: savedName || undefined, email: savedEmail || undefined };
    }
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Application Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [settings, setSettings] = useState<StudioSettings>({
    profile: {
      name: "NWA Architects",
      registrationNumber: "AIA-49281-NY",
      hqAddress: "Nilesh Waman & Associates Flat no. 3, 76-Shrushti Prabhat, Kashinath Shastri Abhyankar path, lane no.-15, near symbiosis School, Prabhat road, pune-411004",
      contactEmail: "nwa.architects2002@gmail.com",
      phoneNumber: "+91 9850601673",
    },
    team: [],
    security: {
      twoFactorEnabled: false,
    },
  });

  // Selected Job Filter for Applications view
  const [selectedJobFilter, setSelectedJobFilter] = useState<string | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userInfo = {
          name: user.displayName || user.email?.split('@')[0] || 'Studio Admin',
          email: user.email || '',
        };
        setCurrentUser(userInfo);
        if (userInfo.name) sessionStorage.setItem('nwa_admin_user_name', userInfo.name);
        if (userInfo.email) sessionStorage.setItem('nwa_admin_user_email', userInfo.email);
        setIsAuthenticated(true);
        sessionStorage.setItem('nwa_admin_auth', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial data from server REST API if available
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProjects(data))
      .catch(() => {});

    fetch('/api/jobs')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setJobs(data))
      .catch(() => {});

    fetch('/api/applications')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setApplications(data))
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSettings(data))
      .catch(() => {});

    fetch('/api/inquiries')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setInquiries(data))
      .catch(() => {});
  }, []);

  // Handlers
  const handlePublicNavigate = (tab: PublicTab | 'admin') => {
    if (tab === 'admin') {
      if (isAuthenticated) {
        setIsAdminMode(true);
        setAdminView('dashboard');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      setIsAdminMode(false);
      setActiveTab(tab);
    }
  };

  const handleLoginSuccess = (user?: { name?: string; email: string }) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('nwa_admin_auth', 'true');
    if (user) {
      setCurrentUser(user);
      if (user.name) sessionStorage.setItem('nwa_admin_user_name', user.name);
      if (user.email) sessionStorage.setItem('nwa_admin_user_email', user.email);
    }
    setIsLoginModalOpen(false);
    setIsAdminMode(true);
    setAdminView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('nwa_admin_auth');
    sessionStorage.removeItem('nwa_admin_user_name');
    sessionStorage.removeItem('nwa_admin_user_email');
    auth.signOut().catch(() => {});
    setIsAdminMode(false);
  };

  // Projects Handlers
  const handleAddProject = (p: Omit<Project, 'id' | 'lastEdited' | 'editedBy'>) => {
    const newProj: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      lastEdited: 'Just now',
      editedBy: 'Admin',
    };
    setProjects([newProj, ...projects]);

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    }).catch(() => {});
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));

    fetch(`/api/projects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));

    fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Jobs Handlers
  const handleAddJob = (j: Omit<JobPosting, 'id' | 'postedDate'>) => {
    const newJob: JobPosting = {
      ...j,
      id: `job-${Date.now()}`,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setJobs([newJob, ...jobs]);

    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob),
    }).catch(() => {});
  };

  const handleUpdateJob = (updated: JobPosting) => {
    setJobs(jobs.map((j) => (j.id === updated.id ? updated : j)));

    fetch(`/api/jobs/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));

    fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Application Handlers
  const handleSubmitApplication = (appData: {
    candidateName: string;
    email: string;
    position: string;
    portfolioUrl: string;
    coverLetter: string;
    resumeName?: string;
    resumeUrl?: string;
    resumeSize?: string;
    resumeType?: string;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size?: string;
      storageType?: 'bucket' | 'local' | 'cloud_sql';
    }>;
    experienceSummary?: Array<{
      role: string;
      company: string;
      period: string;
      description?: string;
    }>;
  }) => {
    let attachments = appData.attachments || [];
    if (attachments.length === 0) {
      if (appData.resumeName) {
        attachments = [{
          name: appData.resumeName,
          url: appData.resumeUrl || '/uploads/resumes/Sample_Architectural_CV.pdf',
          type: appData.resumeType || 'PDF Document',
          size: appData.resumeSize || '1.8 MB',
          storageType: 'bucket',
        }];
      } else {
        attachments = [{
          name: 'Resume.pdf',
          url: '/uploads/resumes/Sample_Architectural_CV.pdf',
          type: 'PDF Document',
          size: '1.2 MB',
          storageType: 'bucket',
        }];
      }
    }

    const expSummary =
      appData.experienceSummary && appData.experienceSummary.length > 0
        ? appData.experienceSummary
        : [{ role: 'Applicant', company: 'Portfolio & CV Submission', period: 'Current' }];

    const newApp: Application = {
      id: `app-${Date.now()}`,
      candidateName: appData.candidateName,
      position: appData.position,
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'New',
      email: appData.email,
      portfolioUrl: appData.portfolioUrl,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      experienceSummary: expSummary,
      attachments,
      notes: appData.coverLetter ? `Cover Letter: ${appData.coverLetter}` : '',
    };

    setApplications([newApp, ...applications]);

    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...appData,
        attachments,
      }),
    }).catch((err) => {
      console.error('Error posting application:', err);
    });
  };

  const handleUpdateApplication = (updated: Application) => {
    setApplications(applications.map((a) => (a.id === updated.id ? updated : a)));

    fetch(`/api/applications/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  // Inquiry Handlers
  const handleSubmitInquiry = (inquiry: {
    name: string;
    email: string;
    projectType: string;
    message: string;
  }) => {
    const newInquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      ...inquiry,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInquiries([newInquiry, ...inquiries]);

    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    }).catch(() => {});
  };

  const handleDeleteInquiry = (id: string) => {
    setInquiries(inquiries.filter((inq) => inq.id !== id));

    fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Settings Handler
  const handleUpdateSettings = (newSettings: StudioSettings) => {
    setSettings(newSettings);

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col font-sans selection:bg-[#a33e00] selection:text-white antialiased">
      {isAdminMode ? (
        /* Admin Portal View Layout */
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          {/* Mobile Admin Bar */}
          <div className="md:hidden bg-[#000000] text-white p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-3">
              {adminView !== 'dashboard' && (
                <button
                  onClick={() => setAdminView('dashboard')}
                  className="flex items-center gap-1 text-xs label-caps bg-white/10 hover:bg-[#a33e00] px-2.5 py-1.5 rounded transition-colors text-white font-medium"
                  title="Back to Dashboard"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Dashboard</span>
                </button>
              )}
              <span className="font-serif font-bold text-base md:text-lg">
                {adminView === 'dashboard'
                  ? 'Studio Admin'
                  : adminView === 'projects'
                  ? 'Projects'
                  : adminView === 'jobs'
                  ? 'Job Postings'
                  : adminView === 'applications'
                  ? 'Applications'
                  : adminView === 'inquiries'
                  ? 'Client Inquiries'
                  : 'Settings'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs label-caps uppercase bg-white/10 px-3 py-1.5 rounded hover:bg-[#a33e00] transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Side Nav */}
          <SideNavBar
            currentView={adminView}
            onNavigate={(view) => setAdminView(view)}
            onExitAdmin={handleLogout}
            inquiriesCount={inquiries.length}
            currentUser={currentUser}
          />

          {/* Admin Content Screen */}
          <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-y-auto">
            {adminView === 'dashboard' && (
              <AdminDashboard
                projects={projects}
                jobs={jobs}
                applications={applications}
                inquiries={inquiries}
                onNavigate={(v) => setAdminView(v)}
                onExitAdmin={handleLogout}
              />
            )}

            {adminView === 'projects' && (
              <AdminProjects
                projects={projects}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onNavigate={(v) => setAdminView(v)}
              />
            )}

            {adminView === 'jobs' && (
              <AdminJobs
                jobs={jobs}
                applications={applications}
                onAddJob={handleAddJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onViewApplications={(jobTitle) => {
                  setSelectedJobFilter(jobTitle);
                  setAdminView('applications');
                }}
                onNavigate={(v) => setAdminView(v)}
              />
            )}

            {adminView === 'applications' && (
              <AdminApplications
                applications={applications}
                jobs={jobs}
                selectedJobFilter={selectedJobFilter}
                onClearJobFilter={() => setSelectedJobFilter(null)}
                onUpdateApplication={handleUpdateApplication}
                onNavigate={(v) => setAdminView(v)}
              />
            )}

            {adminView === 'inquiries' && (
              <AdminInquiries
                inquiries={inquiries}
                onDeleteInquiry={handleDeleteInquiry}
                onNavigate={(v) => setAdminView(v)}
              />
            )}

            {adminView === 'settings' && (
              <AdminSettings
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onNavigate={(v) => setAdminView(v)}
              />
            )}
          </div>
        </div>
      ) : (
        /* Public Studio Website Layout */
        <div className="flex-1 flex flex-col">
          <TopNavBar activeTab={activeTab} onNavigate={handlePublicNavigate} />

          <div className="flex-1">
            {activeTab === 'portfolio' && (
              <PortfolioView projects={projects} onNavigate={handlePublicNavigate} />
            )}

            {(activeTab === 'about' || activeTab === 'studio') && (
              <AboutView onNavigate={handlePublicNavigate} />
            )}

            {activeTab === 'careers' && (
              <CareersView
                jobs={jobs}
                onSubmitApplication={handleSubmitApplication}
              />
            )}

            {activeTab === 'contact' && (
              <ContactView onSubmitInquiry={handleSubmitInquiry} />
            )}
          </div>

          <Footer />
        </div>
      )}

      {/* Admin Login Modal Flow */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
