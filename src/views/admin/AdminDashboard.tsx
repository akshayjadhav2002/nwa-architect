import React from 'react';
import { Project, JobPosting, Application, ContactInquiry } from '../../types';

interface AdminDashboardProps {
  projects: Project[];
  jobs: JobPosting[];
  applications: Application[];
  inquiries?: ContactInquiry[];
  onNavigate: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'inquiries' | 'settings') => void;
  onExitAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  jobs,
  applications,
  inquiries = [],
  onNavigate,
  onExitAdmin,
}) => {
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const newAppsCount = applications.filter((a) => a.status === 'New' || a.status === 'Reviewing').length;

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#747878]/15 pb-8 gap-4">
        <div>
          {onExitAdmin && (
            <button
              type="button"
              onClick={onExitAdmin}
              className="md:hidden inline-flex items-center gap-1.5 text-xs label-caps font-bold text-[#a33e00] hover:text-[#000000] mb-3 transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Main Website</span>
            </button>
          )}
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-[#000000] tracking-tight">
            Dashboard
          </h2>
          <p className="text-base md:text-lg text-[#444748] mt-2 max-w-2xl">
            Overview of studio operations, active projects, and recruitment pipeline.
          </p>
        </div>
        <div className="hidden md:flex gap-4">
          <button
            onClick={() => onNavigate('projects')}
            className="bg-[#000000] text-white label-caps px-6 py-3 hover:bg-[#a33e00] transition-colors"
          >
            + New Project
          </button>
        </div>
      </header>

      {/* Summary Cards Grid (Bento Style) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="bg-[#edeeef] p-6 sm:p-8 border border-[#747878]/15 hover:border-[#747878]/40 transition-colors relative group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-8 sm:mb-12">
            <span className="label-caps text-[#444748] uppercase tracking-widest text-xs">
              Total Projects
            </span>
            <span className="material-symbols-outlined text-[#a33e00]">
              architecture
            </span>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-6xl font-bold text-[#000000] mb-2">
              {projects.length < 10 ? `0${projects.length}` : projects.length}
            </div>
            <p className="text-xs text-[#444748]">+3 this month</p>
          </div>
        </div>

        {/* Card 2: Active Job Postings */}
        <div
          onClick={() => onNavigate('jobs')}
          className="bg-[#edeeef] p-6 sm:p-8 border border-[#747878]/15 hover:border-[#747878]/40 transition-colors relative group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-8 sm:mb-12">
            <span className="label-caps text-[#444748] uppercase tracking-widest text-xs">
              Active Openings
            </span>
            <span className="material-symbols-outlined text-[#a33e00]">
              work
            </span>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-6xl font-bold text-[#000000] mb-2">
              {activeJobsCount < 10 ? `0${activeJobsCount}` : activeJobsCount}
            </div>
            <p className="text-xs text-[#444748]">Recruitment pipeline active</p>
          </div>
        </div>

        {/* Card 3: New Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-[#edeeef] p-6 sm:p-8 border border-[#747878]/15 hover:border-[#747878]/40 transition-colors relative group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-8 sm:mb-12">
            <span className="label-caps text-[#444748] uppercase tracking-widest text-xs">
              Applications
            </span>
            <span className="material-symbols-outlined text-[#a33e00]">
              description
            </span>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-6xl font-bold text-[#000000] mb-2">
              {applications.length < 10 ? `0${applications.length}` : applications.length}
            </div>
            <p className="text-xs text-[#444748]">{newAppsCount} pending review</p>
          </div>
        </div>

        {/* Card 4: Client Inquiries */}
        <div
          onClick={() => onNavigate('inquiries')}
          className="bg-[#edeeef] p-6 sm:p-8 border border-[#747878]/15 hover:border-[#747878]/40 transition-colors relative group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-8 sm:mb-12">
            <span className="label-caps text-[#444748] uppercase tracking-widest text-xs">
              Client Inquiries
            </span>
            <span className="material-symbols-outlined text-[#a33e00]">
              mail
            </span>
          </div>
          <div>
            <div className="font-serif text-4xl sm:text-6xl font-bold text-[#000000] mb-2">
              {inquiries.length < 10 ? `0${inquiries.length}` : inquiries.length}
            </div>
            <p className="text-xs text-[#444748]">Website commissions received</p>
          </div>
        </div>
      </section>

      {/* Main Complex Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
        {/* Recent Projects List (Span 8) */}
        <div className="col-span-1 md:col-span-8">
          <h3 className="font-serif text-2xl font-bold text-[#000000] mb-6 border-b border-[#747878]/15 pb-4">
            Recent Projects
          </h3>

          <div className="divide-y divide-[#747878]/15">
            {projects.slice(0, 4).map((project, idx) => (
              <div
                key={project.id}
                onClick={() => onNavigate('projects')}
                className="flex justify-between items-center py-6 group cursor-pointer hover:bg-[#edeeef]/50 transition-colors px-4 -mx-4"
              >
                <div className="flex items-center gap-6">
                  <span className="font-serif text-2xl text-[#444748]/50 w-8 group-hover:text-[#a33e00] transition-colors">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-lg text-[#000000]">
                      {project.title}
                    </h4>
                    <p className="label-caps text-[#444748] text-[10px] mt-1 uppercase">
                      {project.category} • {project.status}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right text-xs text-[#444748]">
                  Last edited {project.lastEdited}<br />
                  <span className="text-[10px] opacity-70">by {project.editedBy}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-2 mt-6 label-caps text-[#000000] hover:text-[#a33e00] transition-colors uppercase tracking-widest"
          >
            <span>View All Projects</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Quick Actions & Image Widget (Span 4) */}
        <div className="col-span-1 md:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div className="bg-[#f3f4f5] p-6 border border-[#747878]/15 space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#000000]">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onNavigate('jobs')}
                className="w-full flex items-center justify-between p-4 border border-[#747878]/30 hover:border-[#a33e00] transition-colors group bg-white"
              >
                <span className="label-caps text-[#000000] uppercase group-hover:text-[#a33e00]">
                  Draft Job Posting
                </span>
                <span className="material-symbols-outlined text-[#747878] group-hover:text-[#a33e00]">
                  add
                </span>
              </button>

              <button
                onClick={() => onNavigate('applications')}
                className="w-full flex items-center justify-between p-4 border border-[#747878]/30 hover:border-[#a33e00] transition-colors group bg-white"
              >
                <span className="label-caps text-[#000000] uppercase group-hover:text-[#a33e00]">
                  Review Applications
                </span>
                <span className="material-symbols-outlined text-[#747878] group-hover:text-[#a33e00]">
                  arrow_forward
                </span>
              </button>

              <button
                onClick={() => onNavigate('inquiries')}
                className="w-full flex items-center justify-between p-4 border border-[#747878]/30 hover:border-[#a33e00] transition-colors group bg-white"
              >
                <span className="label-caps text-[#000000] uppercase group-hover:text-[#a33e00]">
                  Client Inquiries
                </span>
                <span className="material-symbols-outlined text-[#747878] group-hover:text-[#a33e00]">
                  mail
                </span>
              </button>
            </div>
          </div>

          {/* Visual Widget / Featured Image */}
          <div className="relative h-64 bg-[#edeeef] overflow-hidden group border border-[#747878]/15">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOg9ss3T3KcT723XDH2jEFvKOsJIJvBkeZWDfuyCkkMogc1U8n7m-BUczTHs4xoZjFLhjc6N7Qi_xQHvtRMnQ4YoYT0yokTFmQnwXYiw4wXPd7TE1CsuPflN126-HOwD-btSdz42DTaMzrrz55SIohysRLvZ6_SAHm6Q3lGx5O8Wk8DIYX7fZ1byUNZVm5CyCPoFoDu6E-g67b7cCDPMkmNbzg1v9uwTUFrMoJlenYmzJQK5PcJ-p6DQ"
              alt="Featured Design"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 border border-[#747878]/15">
              <p className="label-caps text-[#000000] text-[10px] uppercase mb-1">
                Featured Design
              </p>
              <p className="text-sm font-semibold text-[#191c1d] truncate">
                The Obsidian Residence Details
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
