import React, { useState, useEffect } from 'react';
import { ContactInquiry } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface AdminInquiriesProps {
  inquiries: ContactInquiry[];
  onUpdateInquiry?: (updated: ContactInquiry) => void;
  onDeleteInquiry: (id: string) => void;
  onNavigate?: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'inquiries' | 'settings') => void;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  inquiries,
  onUpdateInquiry,
  onDeleteInquiry,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Contacted'>('All');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(null);

  // Derive unique project types for filtering
  const projectTypeSet = new Set<string>();
  inquiries.forEach((inq) => {
    if (inq.projectType) projectTypeSet.add(inq.projectType);
  });
  const uniqueTypes = Array.from(projectTypeSet);

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.phone && inq.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.projectType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'All' ||
      inq.projectType.toLowerCase() === filterType.toLowerCase();

    const currentStatus = inq.status || 'New';
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'New' && currentStatus === 'New') ||
      (statusFilter === 'Contacted' && currentStatus === 'Contacted');

    return matchesSearch && matchesType && matchesStatus;
  });

  const currentInquiry =
    filteredInquiries.find((i) => i.id === selectedId) ||
    inquiries.find((i) => i.id === selectedId) ||
    filteredInquiries[0] ||
    inquiries[0];

  useEffect(() => {
    if (filteredInquiries.length > 0 && !filteredInquiries.some((i) => i.id === selectedId)) {
      setSelectedId(filteredInquiries[0].id);
    }
  }, [filteredInquiries, selectedId]);

  const handleToggleStatus = (inquiry: ContactInquiry, targetStatus?: 'New' | 'Contacted') => {
    if (!onUpdateInquiry) return;
    const nextStatus = targetStatus || (inquiry.status === 'Contacted' ? 'New' : 'Contacted');
    onUpdateInquiry({
      ...inquiry,
      status: nextStatus,
    });
  };

  const fallbackCopy = (text: string, isPhone = false) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (isPhone) {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch (e) {
      console.error('Fallback copy failed:', e);
    }
  };

  const handleCopyEmail = (email: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          setCopiedEmail(true);
          setTimeout(() => setCopiedEmail(false), 2000);
        })
        .catch(() => {
          fallbackCopy(email, false);
        });
    } else {
      fallbackCopy(email, false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(phone)
        .then(() => {
          setCopiedPhone(true);
          setTimeout(() => setCopiedPhone(false), 2000);
        })
        .catch(() => {
          fallbackCopy(phone, true);
        });
    } else {
      fallbackCopy(phone, true);
    }
  };

  const confirmDelete = () => {
    if (inquiryToDelete) {
      onDeleteInquiry(inquiryToDelete.id);
      setInquiryToDelete(null);
      setShowMobileDetail(false);
    }
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const newCount = inquiries.filter((i) => (i.status || 'New') === 'New').length;
  const contactedCount = inquiries.filter((i) => i.status === 'Contacted').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Header Bar */}
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
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#000000]">
              Client Inquiries
            </h2>
          </div>
          <p className="text-xs text-[#444748] mt-0.5">
            Prospective client commissions and messages received from the public website contact form.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="w-full sm:w-72">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747878] text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search sender, email, inquiry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#747878]/20 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#a33e00] transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Inquiry List */}
        <div className="w-full md:w-5/12 lg:w-4/12 border-r border-[#747878]/15 flex flex-col bg-white overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-[#747878]/15 bg-[#f8f9fa] flex flex-col gap-3">
            {/* Status Tabs (All, New, Contacted) */}
            <div className="flex items-center justify-between">
              <span className="label-caps text-[11px] text-[#444748] font-bold uppercase tracking-wider">
                Status Filter
              </span>
              {(statusFilter !== 'All' || filterType !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setFilterType('All');
                    setSearchTerm('');
                  }}
                  className="text-[10px] text-[#a33e00] hover:underline uppercase font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#e7e8e9] rounded-sm">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`py-1 text-xs label-caps font-bold transition-all rounded-xs text-center cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-white text-[#000000] shadow-xs'
                    : 'text-[#444748] hover:text-[#000000]'
                }`}
              >
                All ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('New')}
                className={`py-1 text-xs label-caps font-bold transition-all rounded-xs text-center flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === 'New'
                    ? 'bg-[#a33e00] text-white shadow-xs'
                    : 'text-[#444748] hover:text-[#a33e00]'
                }`}
              >
                <span>New</span>
                <span className={`text-[10px] px-1 rounded-full font-mono ${statusFilter === 'New' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                  {newCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Contacted')}
                className={`py-1 text-xs label-caps font-bold transition-all rounded-xs text-center flex items-center justify-center gap-1 cursor-pointer ${
                  statusFilter === 'Contacted'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-[#444748] hover:text-emerald-700'
                }`}
              >
                <span>Contacted</span>
                <span className={`text-[10px] px-1 rounded-full font-mono ${statusFilter === 'Contacted' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                  {contactedCount}
                </span>
              </button>
            </div>

            {/* Project Types */}
            {uniqueTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => setFilterType('All')}
                  className={`px-2 py-0.5 text-[11px] label-caps rounded-xs transition-colors cursor-pointer ${
                    filterType === 'All'
                      ? 'bg-[#000000] text-white font-bold'
                      : 'bg-white border border-[#747878]/20 text-[#444748] hover:bg-[#f3f4f5]'
                  }`}
                >
                  All Types
                </button>
                {uniqueTypes.map((t) => {
                  const count = inquiries.filter(
                    (i) => i.projectType?.toLowerCase() === t.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2 py-0.5 text-[11px] label-caps rounded-xs uppercase transition-colors cursor-pointer ${
                        filterType.toLowerCase() === t.toLowerCase()
                          ? 'bg-[#000000] text-white font-bold'
                          : 'bg-white border border-[#747878]/20 text-[#444748] hover:bg-[#f3f4f5]'
                      }`}
                    >
                      {t} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inquiry Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#747878]/10">
            {filteredInquiries.length === 0 ? (
              <div className="p-12 text-center text-[#747878]">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-40">
                  inbox
                </span>
                <p className="text-sm font-serif">No inquiries found</p>
                <p className="text-xs text-[#747878] mt-1">
                  {searchTerm || filterType !== 'All' || statusFilter !== 'All'
                    ? 'Try adjusting your search query or status filters.'
                    : 'New inquiries submitted on the contact page will appear here.'}
                </p>
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = inq.id === currentInquiry?.id;
                const isNew = (inq.status || 'New') === 'New';

                return (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedId(inq.id);
                      setShowMobileDetail(true);
                    }}
                    className={`p-4 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-[#f3f4f5] border-l-4 border-l-[#a33e00]'
                        : isNew
                        ? 'bg-amber-50/20 hover:bg-[#f8f9fa] border-l-4 border-l-amber-500/60'
                        : 'hover:bg-[#f8f9fa] border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-semibold text-sm text-[#000000] truncate">
                          {inq.name}
                        </h4>
                        {/* New Tag or Contacted Indicator */}
                        {isNew ? (
                          <span className="bg-[#a33e00] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs shrink-0 shadow-xs">
                            NEW
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs shrink-0 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">check</span>
                            <span>Contacted</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#747878] shrink-0 font-mono">
                        {formatDisplayDate(inq.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="label-caps text-[10px] bg-[#e7e8e9] text-[#191c1d] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                        {inq.projectType || 'General Inquiry'}
                      </span>
                      <span className="text-xs text-[#747878] truncate">
                        {inq.email}
                      </span>
                      {inq.phone && (
                        <>
                          <span className="text-xs text-[#747878]">•</span>
                          <span className="text-xs text-[#444748] font-mono">
                            {inq.phone}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-[#444748] line-clamp-2 leading-relaxed">
                      {inq.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Inquiry Detail View (Desktop) */}
        <div className="hidden md:flex flex-1 flex-col bg-[#f8f9fa] overflow-y-auto p-6 md:p-10">
          {currentInquiry ? (
            <div className="max-w-3xl w-full mx-auto space-y-6 animate-fade-in">
              {/* Inquiry Action Bar */}
              <div className="bg-white p-6 border border-[#747878]/15 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#747878]/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl font-bold text-[#000000]">
                        {currentInquiry.name}
                      </h3>
                      {/* Status Badge */}
                      {(currentInquiry.status || 'New') === 'New' ? (
                        <span className="bg-[#a33e00] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
                          NEW INQUIRY
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>CONTACTED</span>
                        </span>
                      )}
                      <span className="label-caps text-xs bg-[#a33e00]/10 text-[#a33e00] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        {currentInquiry.projectType}
                      </span>
                    </div>
                    <p className="text-xs text-[#444748] mt-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-[#747878]">
                        schedule
                      </span>
                      <span>Received {formatDisplayDate(currentInquiry.createdAt)}</span>
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mark as Contacted / Toggle Status Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(currentInquiry)}
                      className={`inline-flex items-center gap-1.5 text-xs label-caps font-bold px-3.5 py-2 transition-all cursor-pointer uppercase tracking-wider border ${
                        (currentInquiry.status || 'New') === 'New'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white hover:bg-[#f3f4f5] text-emerald-800 border-emerald-300'
                      }`}
                      title={
                        (currentInquiry.status || 'New') === 'New'
                          ? 'Mark this client inquiry as contacted to remove the NEW tag'
                          : 'Click to mark as New again'
                      }
                    >
                      <span className="material-symbols-outlined text-sm">
                        {(currentInquiry.status || 'New') === 'New' ? 'check_circle' : 'undo'}
                      </span>
                      <span>
                        {(currentInquiry.status || 'New') === 'New'
                          ? 'Mark as Contacted'
                          : 'Mark as New'}
                      </span>
                    </button>

                    <a
                      href={`mailto:${currentInquiry.email}?subject=NWA%20Architects%20-%20Response%20to%20your%20${encodeURIComponent(
                        currentInquiry.projectType || 'Project'
                      )}%20Inquiry`}
                      onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                      className="inline-flex items-center gap-1.5 bg-[#000000] text-white text-xs label-caps font-bold px-4 py-2 hover:bg-[#a33e00] transition-colors uppercase tracking-wider"
                      title="Send email response and mark as Contacted"
                    >
                      <span className="material-symbols-outlined text-sm">reply</span>
                      <span>Reply</span>
                    </a>

                    {currentInquiry.phone && (
                      <a
                        href={`tel:${currentInquiry.phone}`}
                        onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#747878]/30 text-[#191c1d] text-xs label-caps font-bold px-3 py-2 hover:bg-[#f3f4f5] transition-colors uppercase"
                        title="Call mobile number and mark as Contacted"
                      >
                        <span className="material-symbols-outlined text-sm text-[#a33e00]">call</span>
                        <span>Call</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleCopyEmail(currentInquiry.email)}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#747878]/30 text-[#191c1d] text-xs label-caps font-medium px-3 py-2 hover:bg-[#f3f4f5] transition-colors"
                      title="Copy email address"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedEmail ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                    </button>

                    <button
                      onClick={() => setInquiryToDelete(currentInquiry)}
                      className="p-2 text-[#747878] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete inquiry"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Client Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f8f9fa] p-4 border border-[#747878]/10 text-xs">
                  <div>
                    <span className="label-caps text-[#747878] block mb-1">Email Address</span>
                    <a
                      href={`mailto:${currentInquiry.email}`}
                      onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                      className="font-mono text-[#000000] hover:text-[#a33e00] transition-colors font-medium break-all"
                    >
                      {currentInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="label-caps text-[#747878] block mb-1">Mobile Number</span>
                    {currentInquiry.phone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${currentInquiry.phone}`}
                          onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                          className="font-mono text-[#000000] hover:text-[#a33e00] transition-colors font-semibold"
                        >
                          {currentInquiry.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(currentInquiry.phone!)}
                          className="p-0.5 text-[#747878] hover:text-[#a33e00] cursor-pointer"
                          title="Copy phone number"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {copiedPhone ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#747878] italic">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="label-caps text-[#747878] block mb-1">Commission Category</span>
                    <p className="font-semibold text-[#000000] uppercase">
                      {currentInquiry.projectType || 'General Consultation'}
                    </p>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="label-caps text-[11px] text-[#000000] uppercase tracking-widest mb-3 border-b border-[#747878]/10 pb-2">
                    Client Message & Brief
                  </h4>
                  <div className="bg-[#fcfcfc] p-6 border border-[#747878]/15 rounded text-sm text-[#191c1d] leading-relaxed whitespace-pre-line font-sans">
                    {currentInquiry.message}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-12 text-[#747878]">
              <div>
                <span className="material-symbols-outlined text-5xl opacity-30 mb-3 block">
                  mark_email_unread
                </span>
                <p className="font-serif text-lg text-[#000000]">No Inquiry Selected</p>
                <p className="text-xs text-[#747878] mt-1 max-w-sm">
                  Select an inquiry from the left panel to review message details and compose client responses.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Detail View */}
      {showMobileDetail && currentInquiry && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-none p-6 space-y-6 animate-slide-up">
            <div className="flex justify-between items-start border-b border-[#747878]/15 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="label-caps text-[10px] text-[#a33e00] font-bold uppercase">
                    {currentInquiry.projectType}
                  </span>
                  {(currentInquiry.status || 'New') === 'New' ? (
                    <span className="bg-[#a33e00] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs">
                      NEW
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs">
                      CONTACTED
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-[#000000] mt-1">
                  {currentInquiry.name}
                </h3>
                <p className="text-xs text-[#747878] flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span>{currentInquiry.email}</span>
                  {currentInquiry.phone && (
                    <>
                      <span>•</span>
                      <a href={`tel:${currentInquiry.phone}`} className="font-mono text-[#a33e00] font-semibold underline">
                        {currentInquiry.phone}
                      </a>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDisplayDate(currentInquiry.createdAt)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowMobileDetail(false)}
                className="p-1 text-[#747878] hover:text-[#000000]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <span className="label-caps text-xs text-[#747878] block mb-2">Message</span>
              <p className="text-sm text-[#191c1d] leading-relaxed bg-[#f8f9fa] p-4 border border-[#747878]/15">
                {currentInquiry.message}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleToggleStatus(currentInquiry)}
                className={`w-full py-2.5 text-xs label-caps font-bold transition-colors uppercase border flex items-center justify-center gap-1.5 ${
                  (currentInquiry.status || 'New') === 'New'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {(currentInquiry.status || 'New') === 'New' ? 'check_circle' : 'undo'}
                </span>
                <span>
                  {(currentInquiry.status || 'New') === 'New' ? 'Mark as Contacted' : 'Mark as New'}
                </span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`mailto:${currentInquiry.email}?subject=NWA%20Architects%20Response`}
                  onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                  className="flex-1 bg-[#000000] text-white text-center py-2.5 text-xs label-caps font-bold hover:bg-[#a33e00] transition-colors uppercase"
                >
                  Reply Email
                </a>
                {currentInquiry.phone && (
                  <a
                    href={`tel:${currentInquiry.phone}`}
                    onClick={() => handleToggleStatus(currentInquiry, 'Contacted')}
                    className="flex-1 bg-white border border-[#747878]/30 text-[#191c1d] text-center py-2.5 text-xs label-caps font-bold hover:bg-[#f3f4f5] transition-colors uppercase flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm text-[#a33e00]">call</span>
                    <span>Call</span>
                  </a>
                )}
                <button
                  onClick={() => setInquiryToDelete(currentInquiry)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 text-xs label-caps font-bold hover:bg-red-100 transition-colors uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!inquiryToDelete}
        title="Delete Client Inquiry"
        message={
          inquiryToDelete ? (
            <p>
              Are you sure you want to permanently delete the inquiry from{' '}
              <strong className="text-[#000000] font-semibold">{inquiryToDelete.name}</strong> (
              <span className="font-mono text-xs">{inquiryToDelete.email}</span>)?
              This action cannot be undone.
            </p>
          ) : null
        }
        confirmLabel="Delete Permanently"
        onConfirm={confirmDelete}
        onCancel={() => setInquiryToDelete(null)}
      />
    </div>
  );
};
