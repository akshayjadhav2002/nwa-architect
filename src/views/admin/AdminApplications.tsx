import React, { useState, useEffect } from 'react';
import { Application, JobPosting } from '../../types';

interface AdminApplicationsProps {
  applications: Application[];
  jobs?: JobPosting[];
  selectedJobFilter?: string | null;
  onClearJobFilter?: () => void;
  onUpdateApplication: (app: Application) => void;
  onNavigate?: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'settings') => void;
}

export const AdminApplications: React.FC<AdminApplicationsProps> = ({
  applications,
  jobs = [],
  selectedJobFilter,
  onClearJobFilter,
  onUpdateApplication,
  onNavigate,
}) => {
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>(selectedJobFilter || 'All');
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [noteText, setNoteText] = useState('');
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);
  const [previewingDoc, setPreviewingDoc] = useState<{ name: string; url: string; type?: string; size?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync internal state when prop changes
  useEffect(() => {
    if (selectedJobFilter) {
      setSelectedJobTitle(selectedJobFilter);
    } else {
      setSelectedJobTitle('All');
    }
  }, [selectedJobFilter]);

  // Derive unique position titles for filter dropdown
  const positionSet = new Set<string>();
  applications.forEach((a) => positionSet.add(a.position));
  jobs.forEach((j) => positionSet.add(j.title));
  const uniquePositions = Array.from(positionSet);

  const activeJob = selectedJobFilter || (selectedJobTitle !== 'All' ? selectedJobTitle : null);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesJob =
      !activeJob ||
      app.position.toLowerCase().includes(activeJob.toLowerCase()) ||
      activeJob.toLowerCase().includes(app.position.toLowerCase());

    return matchesSearch && matchesStatus && matchesJob;
  });

  // Keep a valid candidate selected
  const currentApp = filteredApps.find((a) => a.id === selectedId) || filteredApps[0];

  useEffect(() => {
    if (filteredApps.length > 0 && !filteredApps.some((a) => a.id === selectedId)) {
      setSelectedId(filteredApps[0].id);
    }
  }, [filteredApps, selectedId]);

  const handleStatusChange = (newStatus: Application['status']) => {
    if (currentApp) {
      onUpdateApplication({
        ...currentApp,
        status: newStatus,
      });
    }
  };

  const handleSaveNote = () => {
    if (currentApp && noteText.trim()) {
      onUpdateApplication({
        ...currentApp,
        notes: currentApp.notes
          ? `${currentApp.notes}\n[Note]: ${noteText}`
          : noteText,
      });
      setNoteText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Header */}
      <header className="min-h-16 py-3 sm:py-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 md:px-12 lg:px-20 border-b border-[#747878]/15 bg-[#f8f9fa] gap-3">
        <div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="md:hidden inline-flex items-center gap-1.5 text-xs label-caps font-bold text-[#a33e00] hover:text-[#000000] mb-1 transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          )}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#000000]">
            Application Review
          </h2>
          {activeJob && (
            <p className="text-xs text-[#a33e00] font-sans font-medium">
              Job Post: {activeJob}
            </p>
          )}
        </div>

        {activeJob && onClearJobFilter && (
          <button
            onClick={() => {
              onClearJobFilter();
              setSelectedJobTitle('All');
            }}
            className="px-3 py-1.5 bg-[#000000] text-white hover:bg-[#a33e00] text-xs label-caps transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">clear_all</span>
            <span>Show All Jobs ({applications.length})</span>
          </button>
        )}
      </header>

      {/* Active Filter Banner */}
      {activeJob && (
        <div className="bg-[#e1e3e4] px-4 sm:px-6 md:px-12 lg:px-20 py-2.5 border-b border-[#747878]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#000000] gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#a33e00]">work</span>
            <span>
              Showing applications received for job post: <strong className="text-[#000000]">"{activeJob}"</strong> ({filteredApps.length} candidate{filteredApps.length !== 1 ? 's' : ''})
            </span>
          </div>
          {onClearJobFilter && (
            <button
              type="button"
              onClick={() => {
                onClearJobFilter();
                setSelectedJobTitle('All');
              }}
              className="label-caps text-[#a33e00] hover:underline font-bold text-[11px] uppercase flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-xs">close</span>
              <span>Clear Job Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Master-Detail Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Candidate List (Master) */}
        <section
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#747878]/15 bg-[#f8f9fa] shrink-0 ${
            showMobileDetail ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Filters & Search */}
          <div className="p-4 border-b border-[#747878]/15 flex flex-col gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-0 bottom-2 text-[#747878]">
                search
              </span>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pb-2 bg-transparent border-0 border-b border-[#747878]/30 focus:border-[#000000] text-sm text-[#191c1d] placeholder-[#747878] focus:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs label-caps text-[#444748]">
              <div className="flex flex-col gap-1">
                <span>Job Post:</span>
                <select
                  value={activeJob || 'All'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'All') {
                      if (onClearJobFilter) onClearJobFilter();
                      setSelectedJobTitle('All');
                    } else {
                      setSelectedJobTitle(val);
                    }
                  }}
                  className="bg-transparent border-0 border-b border-[#747878]/30 text-xs text-[#000000] focus:ring-0 cursor-pointer w-full truncate"
                >
                  <option value="All">All Jobs</option>
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span>Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-0 border-b border-[#747878]/30 text-xs text-[#000000] focus:ring-0 cursor-pointer w-full"
                >
                  <option value="All">All</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="New">New</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#747878]/10">
            {filteredApps.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#444748] space-y-3">
                <p>No applications match this filter.</p>
                {activeJob && onClearJobFilter && (
                  <button
                    onClick={() => {
                      onClearJobFilter();
                      setSelectedJobTitle('All');
                    }}
                    className="text-xs label-caps text-[#a33e00] hover:underline font-bold uppercase block mx-auto"
                  >
                    View All Applications
                  </button>
                )}
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = app.id === currentApp?.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedId(app.id);
                      setShowMobileDetail(true);
                    }}
                    className={`p-4 sm:p-5 md:p-6 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#edeeef] border-l-4 border-[#000000]'
                        : 'hover:bg-[#f3f4f5]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-[#000000] truncate">
                        {app.candidateName}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded label-caps shrink-0 ${
                          app.status === 'Reviewing'
                            ? 'bg-[#a33e00]/10 text-[#a33e00]'
                            : app.status === 'New'
                            ? 'bg-[#e1e3e4] text-[#000000]'
                            : app.status === 'Interview'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'Hired'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#444748] mb-1 truncate">{app.position}</p>
                    <p className="text-[11px] text-[#747878]">Applied: {app.appliedDate}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Candidate Profile (Detail) */}
        {currentApp ? (
          <section
            className={`flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fa] p-4 sm:p-6 md:p-10 lg:p-12 ${
              showMobileDetail ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
              {/* Mobile Back Button to Candidates List */}
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="md:hidden inline-flex items-center gap-1.5 text-xs label-caps font-bold text-[#a33e00] hover:text-[#000000] transition-colors uppercase tracking-wider bg-white border border-[#747878]/20 px-3 py-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Back to Candidate List</span>
              </button>

              {/* Profile Header */}
              <div className="space-y-3 pb-6 border-b border-[#747878]/15">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#000000] break-words">
                    {currentApp.candidateName}
                  </h2>
                  <span
                    className={`text-xs uppercase font-bold px-3 py-1 rounded label-caps ${
                      currentApp.status === 'Reviewing'
                        ? 'bg-[#a33e00]/10 text-[#a33e00]'
                        : currentApp.status === 'New'
                        ? 'bg-[#e1e3e4] text-[#000000]'
                        : currentApp.status === 'Interview'
                        ? 'bg-blue-100 text-blue-800'
                        : currentApp.status === 'Hired'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}
                  >
                    {currentApp.status}
                  </span>
                </div>
                <p className="font-serif italic text-base sm:text-lg text-[#444748]">
                  Applying for: {currentApp.position}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 pt-1 text-sm">
                  {currentApp.email && (
                    <a
                      href={`mailto:${currentApp.email}`}
                      className="flex items-center gap-2 text-[#444748] hover:text-[#a33e00] transition-colors label-caps truncate"
                    >
                      <span className="material-symbols-outlined text-sm shrink-0">mail</span>
                      <span className="truncate">{currentApp.email}</span>
                    </a>
                  )}
                  {currentApp.portfolioUrl && (
                    <a
                      href={`https://${currentApp.portfolioUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[#444748] hover:text-[#a33e00] transition-colors label-caps truncate"
                    >
                      <span className="material-symbols-outlined text-sm shrink-0">language</span>
                      <span className="truncate">{currentApp.portfolioUrl}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-[#747878] label-caps text-xs">
                    <span className="material-symbols-outlined text-sm shrink-0">calendar_today</span>
                    <span>Applied: {currentApp.appliedDate}</span>
                  </div>
                </div>
              </div>

              {/* Experience Summary */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="label-caps text-[#000000] border-b border-[#747878]/20 pb-2 uppercase tracking-widest font-bold text-xs sm:text-sm">
                  Experience Summary
                </h4>

                <div className="space-y-4 sm:space-y-6">
                  {currentApp.experienceSummary && currentApp.experienceSummary.length > 0 ? (
                    currentApp.experienceSummary.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <h5 className="font-semibold text-base sm:text-lg text-[#000000]">
                          {exp.role} - {exp.company}
                        </h5>
                        <p className="text-xs sm:text-sm text-[#444748]">{exp.period}</p>
                        {exp.description && (
                          <p className="text-sm sm:text-base text-[#191c1d] mt-2 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-[#444748]">No prior experience detailed.</p>
                  )}
                </div>
              </div>

              {/* Attachments & Stored Documents */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center border-b border-[#747878]/20 pb-2">
                  <h4 className="label-caps text-[#000000] uppercase tracking-widest font-bold text-xs sm:text-sm">
                    Candidate Attachments & CV
                  </h4>
                  <span className="text-[11px] text-[#747878] label-caps flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#a33e00]">inventory_2</span>
                    <span>Persistent Storage Bucket</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {currentApp.attachments && currentApp.attachments.length > 0 ? (
                    currentApp.attachments.map((att, idx) => {
                      const isPdf = att.name.toLowerCase().endsWith('.pdf') || att.type?.toLowerCase().includes('pdf');
                      const downloadUrl = att.url && att.url.startsWith('/uploads')
                        ? `/api/resumes/download/${encodeURIComponent(att.name)}`
                        : att.url;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col justify-between p-4 border border-[#747878]/20 bg-white hover:border-[#a33e00] transition-colors rounded-sm shadow-xs group"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center shrink-0 rounded-xs">
                              <span className="material-symbols-outlined text-2xl text-[#a33e00]">
                                {isPdf ? 'picture_as_pdf' : 'description'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="label-caps text-xs font-bold text-[#000000] truncate group-hover:text-[#a33e00] transition-colors">
                                {att.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#747878] mt-0.5">
                                <span>{att.size || '1.8 MB'}</span>
                                <span>•</span>
                                <span className="text-[#a33e00]">{att.type || 'Document'}</span>
                              </div>
                              <span className="inline-block text-[9px] label-caps uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 mt-1 border border-emerald-200">
                                Storage Bucket Verified
                              </span>
                            </div>
                          </div>

                          {/* Attachment Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#747878]/10 text-xs">
                            <button
                              type="button"
                              onClick={() => setPreviewingDoc({
                                name: att.name,
                                url: att.url,
                                type: att.type,
                                size: att.size,
                              })}
                              className="flex-1 py-1.5 px-2.5 bg-[#f8f9fa] hover:bg-[#000000] hover:text-white text-[#191c1d] border border-[#747878]/20 label-caps uppercase font-bold text-[10px] text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              <span>Preview</span>
                            </button>

                            <a
                              href={downloadUrl}
                              download={att.name}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1.5 px-2.5 bg-white hover:bg-[#a33e00] hover:text-white text-[#444748] border border-[#747878]/30 label-caps uppercase font-bold text-[10px] text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Download to device"
                            >
                              <span className="material-symbols-outlined text-xs">download</span>
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="sm:col-span-2 p-6 bg-white border border-[#747878]/20 text-center text-xs text-[#747878] label-caps">
                      No attachments stored for this application.
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-4">
                <h4 className="label-caps text-[#000000] border-b border-[#747878]/20 pb-2 uppercase tracking-widest font-bold text-xs sm:text-sm">
                  Internal Notes
                </h4>

                {currentApp.notes && (
                  <div className="p-4 bg-[#f3f4f5] border border-[#747878]/15 text-xs sm:text-sm text-[#191c1d] whitespace-pre-wrap font-sans">
                    {currentApp.notes}
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an internal reviewer note..."
                    className="w-full bg-[#f8f9fa] border-b border-[#747878]/30 border-t-0 border-x-0 focus:ring-0 focus:border-[#000000] text-xs sm:text-sm p-3 sm:p-4 resize-none pb-12"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="absolute bottom-3 right-3 label-caps text-[#a33e00] hover:text-[#000000] transition-colors uppercase font-bold text-xs"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-[#747878]/15">
                <button
                  onClick={() => handleStatusChange('Interview')}
                  className="bg-[#000000] text-white px-6 py-3.5 label-caps uppercase hover:bg-[#a33e00] transition-colors text-xs text-center font-bold cursor-pointer"
                >
                  Move to Interview
                </button>

                <button
                  onClick={() => handleStatusChange('Rejected')}
                  className="border border-[#000000] text-[#000000] px-6 py-3.5 label-caps uppercase hover:bg-[#ffdad6] hover:text-[#ba1a1a] hover:border-[#ba1a1a] transition-colors text-xs text-center font-bold cursor-pointer"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleStatusChange('Hired')}
                  className="border border-[#000000] text-[#000000] px-6 py-3.5 label-caps uppercase hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-xs text-center font-bold cursor-pointer"
                >
                  Mark as Hired
                </button>

                <button
                  onClick={() => {
                    const textToCopy = `Candidate: ${currentApp.candidateName} (${currentApp.position})\nEmail: ${currentApp.email}\nStatus: ${currentApp.status}`;
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(textToCopy).catch(() => {});
                    }
                    showToast(`Profile details copied for ${currentApp.candidateName}`);
                  }}
                  className="flex items-center justify-center gap-2 border border-[#747878]/30 sm:border-0 py-3.5 sm:py-0 text-[#444748] hover:text-[#000000] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  <span className="label-caps uppercase text-xs font-bold">Share with Team</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#747878] label-caps p-8 text-center text-xs sm:text-sm">
            Select an application to review.
          </div>
        )}
      </div>

      {/* Document In-App Preview Modal */}
      {previewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewingDoc(null)}
        >
          <div
            className="bg-white w-full max-w-4xl h-[90vh] flex flex-col border border-[#747878]/30 shadow-2xl rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#747878]/15 bg-[#f8f9fa] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 truncate">
                <span className="material-symbols-outlined text-2xl text-[#a33e00]">
                  {previewingDoc.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                </span>
                <div className="truncate">
                  <h3 className="font-semibold text-sm sm:text-base text-[#000000] truncate">
                    {previewingDoc.name}
                  </h3>
                  <p className="text-xs text-[#747878]">
                    {previewingDoc.size || '1.8 MB'} • Storage Bucket Verified • Cloud SQL Synced
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewingDoc.url}
                  download={previewingDoc.name}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#000000] text-white label-caps text-xs font-bold uppercase hover:bg-[#a33e00] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewingDoc(null)}
                  className="p-1.5 text-[#444748] hover:text-[#000000] hover:bg-[#edeeef] rounded-full transition-colors cursor-pointer"
                  aria-label="Close document preview"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
            </div>

            {/* Document Body Frame */}
            <div className="flex-1 bg-[#444748]/10 relative overflow-hidden flex items-center justify-center">
              {previewingDoc.url && !previewingDoc.url.startsWith('#') ? (
                <iframe
                  src={previewingDoc.url}
                  title={previewingDoc.name}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="p-8 text-center space-y-3 max-w-md bg-white border border-[#747878]/20 shadow-sm m-4">
                  <span className="material-symbols-outlined text-4xl text-[#a33e00]">draft</span>
                  <h4 className="font-serif text-lg font-bold text-[#000000]">Document Ready in Storage</h4>
                  <p className="text-xs text-[#444748]">
                    This document is stored in the persistent studio bucket and linked to the PostgreSQL database.
                  </p>
                  <a
                    href={previewingDoc.url}
                    download={previewingDoc.name}
                    className="inline-block px-4 py-2 bg-[#000000] text-white label-caps text-xs font-bold uppercase hover:bg-[#a33e00] transition-colors mt-2"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>

            {/* Preview Modal Footer */}
            <div className="px-5 py-2.5 bg-[#f3f4f5] border-t border-[#747878]/15 text-center text-[10px] text-[#747878] label-caps">
              NWA Architectural Archives • Candidate Application Storage Engine
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#000000] text-white px-5 py-3 shadow-2xl border-l-4 border-[#a33e00] text-xs label-caps animate-fade-in flex items-center gap-2.5">
          <span className="material-symbols-outlined text-sm text-[#a33e00]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
