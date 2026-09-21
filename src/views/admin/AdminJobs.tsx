import React, { useState } from 'react';
import { JobPosting, Application } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface AdminJobsProps {
  jobs: JobPosting[];
  applications?: Application[];
  onAddJob: (j: Omit<JobPosting, 'id' | 'postedDate'>) => void;
  onUpdateJob: (j: JobPosting) => void;
  onDeleteJob: (id: string) => void;
  onViewApplications?: (jobTitle: string) => void;
  onNavigate?: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'settings') => void;
}

export const AdminJobs: React.FC<AdminJobsProps> = ({
  jobs,
  applications = [],
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onViewApplications,
  onNavigate,
}) => {
  const [searchTerm, setSearchText] = useState('');
  const [selectedDept, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatusFilter] = useState<string>('All');

  // Modal State
  const [modalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<JobPosting['department']>('Design');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<JobPosting['status']>('Active');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDepartment('Design');
    setLocation('New York, NY');
    setStatus('Active');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobPosting) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setStatus(job.status);
    setDescription(job.description || '');
    setIsModalOpen(true);
  };

  const handleDuplicate = (job: JobPosting) => {
    onAddJob({
      title: `${job.title} (Copy)`,
      department: job.department,
      location: job.location,
      status: 'Draft',
      description: job.description,
      requirements: job.requirements,
    });
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingJob) {
      onUpdateJob({
        ...editingJob,
        title,
        department,
        location,
        status,
        description,
      });
    } else {
      onAddJob({
        title,
        department,
        location: location || 'New York, NY',
        status,
        description,
      });
    }

    setIsModalOpen(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-6 md:p-12 max-w-[1440px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#747878]/15 pb-8 gap-6">
        <div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="md:hidden inline-flex items-center gap-1.5 text-xs label-caps font-bold text-[#a33e00] hover:text-[#000000] mb-3 transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          )}
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000] mb-2">
            Job Postings
          </h2>
          <p className="text-base text-[#444748] max-w-2xl">
            Manage active recruitment, draft new roles, and oversee departmental needs.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#000000] text-white px-6 py-3 flex items-center gap-2 label-caps hover:bg-[#a33e00] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Create New Posting</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-[#747878]/15 gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#747878]">
            search
          </span>
          <input
            type="text"
            placeholder="Search postings..."
            value={searchTerm}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-[#747878]/30 focus:border-[#000000] focus:ring-0 pl-8 pb-2 text-base text-[#000000] placeholder-[#747878]"
          />
        </div>

        <div className="flex items-center space-x-6 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="label-caps text-[#444748]">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent border-0 border-b border-[#747878]/30 label-caps text-[#000000] focus:ring-0 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Design">Design</option>
              <option value="Architecture">Architecture</option>
              <option value="Interior Design">Interior Design</option>
              <option value="Interiors">Interiors</option>
              <option value="Management">Management</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="label-caps text-[#444748]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent border-0 border-b border-[#747878]/30 label-caps text-[#000000] focus:ring-0 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-6 py-4 border-b border-[#747878]/15 label-caps text-[#444748]">
          <div className="col-span-4">Job Title</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#747878]/15">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-[#444748]">
              No job postings found.
            </div>
          ) : (
            filteredJobs.map((job) => {
              return (
                <div
                  key={job.id}
                  onClick={() => onViewApplications && onViewApplications(job.title)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-6 items-center hover:bg-[#f3f4f5] transition-colors px-4 -mx-4 group cursor-pointer"
                >
                  <div className="col-span-1 md:col-span-4">
                    <h3 className="font-serif text-xl font-bold text-[#000000] group-hover:text-[#a33e00] transition-colors mb-1 flex items-center gap-2">
                      <span>{job.title}</span>
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-[#a33e00]">
                        arrow_forward
                      </span>
                    </h3>
                    <p className="text-xs text-[#444748]">Posted: {job.postedDate}</p>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-base text-[#000000]">{job.department}</span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-base text-[#000000]">{job.location}</span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 label-caps rounded-sm text-[10px] ${
                        job.status === 'Active'
                          ? 'bg-[#e1e3e4] text-[#000000] font-bold'
                          : job.status === 'Draft'
                          ? 'border border-[#747878]/30 text-[#444748]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-end space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(job);
                      }}
                      className="text-[#444748] hover:text-[#000000] transition-colors p-1"
                      title="Edit role"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(job);
                      }}
                      className="text-[#444748] hover:text-[#000000] transition-colors p-1"
                      title="Duplicate role"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobToDelete(job);
                      }}
                      className="text-[#444748] hover:text-[#ba1a1a] transition-colors p-1"
                      title="Delete role"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!jobToDelete}
        title="Delete Job Posting"
        message={
          jobToDelete ? (
            <p>
              Are you sure you want to permanently delete the job posting for{' '}
              <strong className="text-[#000000] font-semibold">{jobToDelete.title}</strong> (
              <span className="font-mono text-xs">{jobToDelete.department}</span>)? This role will be
              removed from the careers page and application pipelines.
            </p>
          ) : null
        }
        confirmLabel="Delete Role"
        onConfirm={() => {
          if (jobToDelete) {
            onDeleteJob(jobToDelete.id);
            setJobToDelete(null);
          }
        }}
        onCancel={() => setJobToDelete(null)}
      />

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f8f9fa] w-full max-w-xl border border-[#747878]/30 p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#000000] hover:text-[#a33e00]"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#000000] mb-6">
              {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
            </h3>

            <form onSubmit={handleSaveJob} className="flex flex-col gap-6">
              <div>
                <label className="label-caps text-[#444748] block mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-underline text-base w-full py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label-caps text-[#444748] block mb-2">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as JobPosting['department'])}
                    className="input-underline text-base w-full py-2 cursor-pointer"
                  >
                    <option value="Design">Design</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Interiors">Interiors</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="label-caps text-[#444748] block mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobPosting['status'])}
                    className="input-underline text-base w-full py-2 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2">Location</label>
                <input
                  type="text"
                  placeholder="New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-underline text-base w-full py-2"
                />
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2">Role Overview</label>
                <textarea
                  rows={4}
                  placeholder="Key responsibilities and qualifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#747878]/20 p-3 text-sm focus:border-[#000000] focus:ring-0 bg-transparent resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-[#000000] label-caps"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#000000] text-white label-caps hover:bg-[#a33e00] uppercase"
                >
                  Save Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
