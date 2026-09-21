import React, { useState, useRef } from 'react';
import { JobPosting } from '../types';

interface ApplyModalProps {
  job: JobPosting | null;
  onClose: () => void;
  onSubmitApplication: (appData: {
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
  }) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, onClose, onSubmitApplication }) => {
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    size: string;
    url: string;
    type?: string;
    isUploaded?: boolean;
    dataUrl?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!job) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const isDoc = file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.txt');

    if (!isDoc && !file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      setUploadError('Please upload a valid PDF, DOC, or DOCX document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds the 20MB limit.');
      return;
    }

    // Read as Base64 data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setIsUploading(true);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl,
            isResume: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Upload failed on server');
        }

        const data = await response.json();
        setResumeFile({
          name: file.name,
          size: data.sizeFormatted || `${sizeInMB} MB`,
          url: data.url,
          type: data.type || 'PDF Document',
          isUploaded: true,
          dataUrl,
        });
      } catch (err: any) {
        console.warn('Storage upload fallback:', err);
        // Fallback to local memory URL if network error
        const objectUrl = URL.createObjectURL(file);
        setResumeFile({
          name: file.name,
          size: `${sizeInMB} MB`,
          url: objectUrl,
          type: file.name.endsWith('.pdf') ? 'PDF Document' : 'Word Document',
          isUploaded: true,
          dataUrl,
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalResumeUrl = resumeFile?.url || '/uploads/resumes/Sample_Architectural_CV.pdf';
    let finalResumeName = resumeFile?.name || 'Resume.pdf';
    let finalResumeSize = resumeFile?.size || '1.2 MB';
    let finalResumeType = resumeFile?.type || 'PDF Document';

    // If resume file has dataUrl but URL not yet saved to backend
    if (resumeFile?.dataUrl && (!resumeFile.url || resumeFile.url.startsWith('blob:'))) {
      try {
        setIsUploading(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: resumeFile.name,
            dataUrl: resumeFile.dataUrl,
            isResume: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          finalResumeUrl = data.url;
          finalResumeSize = data.sizeFormatted || finalResumeSize;
          finalResumeType = data.type || finalResumeType;
        }
      } catch (err) {
        console.error('Final upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const attachments = [
      {
        name: finalResumeName,
        url: finalResumeUrl,
        type: finalResumeType,
        size: finalResumeSize,
        storageType: 'bucket' as const,
      },
    ];

    onSubmitApplication({
      candidateName,
      email,
      position: job.title,
      portfolioUrl,
      coverLetter,
      resumeName: finalResumeName,
      resumeUrl: finalResumeUrl,
      resumeSize: finalResumeSize,
      resumeType: finalResumeType,
      attachments,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-[#f8f9fa] w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] border border-[#747878]/30 shadow-2xl relative flex flex-col rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 md:p-8 pb-4 md:pb-5 border-b border-[#747878]/15 bg-white flex justify-between items-start shrink-0">
          <div>
            <span className="label-caps text-[#a33e00] block mb-1 font-bold text-xs uppercase tracking-wider">
              {job.department} • {job.location}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#000000] tracking-tight">
              Apply for {job.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#444748] hover:text-[#000000] hover:bg-[#f3f4f5] rounded-full transition-colors shrink-0 ml-4 cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-16 px-6 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-[#a33e00]">check_circle</span>
            <h3 className="font-serif text-2xl font-bold text-[#000000]">Application Submitted</h3>
            <p className="text-[#444748] max-w-md">
              Thank you, {candidateName}. Our studio operations team will review your portfolio and resume shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Content */}
            <div className="overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6 flex-1">
              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase text-xs font-semibold">
                  Full Name <span className="text-[#a33e00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g., Elias Thorne"
                  className="w-full bg-white border border-[#747878]/30 px-3 py-2 text-[#000000] focus:ring-1 focus:ring-[#000000] focus:border-[#000000] text-sm"
                />
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase text-xs font-semibold">
                  Email Address <span className="text-[#a33e00]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elias@example.com"
                  className="w-full bg-white border border-[#747878]/30 px-3 py-2 text-[#000000] focus:ring-1 focus:ring-[#000000] focus:border-[#000000] text-sm"
                />
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase text-xs font-semibold">
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://eliasthorne-portfolio.com"
                  className="w-full bg-white border border-[#747878]/30 px-3 py-2 text-[#000000] focus:ring-1 focus:ring-[#000000] focus:border-[#000000] text-sm"
                />
              </div>

              {/* Resume / CV Upload Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label-caps text-[#444748] uppercase text-xs font-semibold">
                    Resume / CV <span className="text-[#a33e00]">*</span>
                  </label>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="resume-file-input"
                />

                {uploadError && (
                  <div className="mb-3 p-2.5 bg-[#ba1a1a]/10 border-l-2 border-[#ba1a1a] text-[#ba1a1a] text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {isUploading ? (
                  <div className="border border-[#747878]/30 p-6 bg-white flex flex-col items-center justify-center gap-2 rounded-sm text-center">
                    <div className="w-6 h-6 border-2 border-[#a33e00] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-[#000000] label-caps uppercase tracking-wider">
                      Uploading document...
                    </p>
                  </div>
                ) : !resumeFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all rounded-sm ${
                      isDragging
                        ? 'border-[#a33e00] bg-[#a33e00]/5'
                        : 'border-[#747878]/30 hover:border-[#000000] bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl text-[#a33e00] mb-2 block">
                      upload_file
                    </span>
                    <p className="text-sm font-semibold text-[#000000] mb-1">
                      Click to upload or drag & drop your Resume / CV
                    </p>
                    <p className="text-xs text-[#747878] label-caps">
                      PDF, DOC, or DOCX (Up to 20MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white border border-[#747878]/30 shadow-xs rounded-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center shrink-0 rounded-xs">
                        <span className="material-symbols-outlined text-2xl text-[#a33e00]">
                          {resumeFile.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-[#000000] truncate">
                          {resumeFile.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#747878]">
                          <span>{resumeFile.size}</span>
                          <span>•</span>
                          <span className="text-[#a33e00] font-medium">{resumeFile.type || 'Document'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {resumeFile.url && !resumeFile.url.startsWith('blob:') && (
                        <a
                          href={resumeFile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-xs label-caps border border-[#747878]/30 text-[#000000] hover:border-[#000000] transition-colors"
                          title="Preview uploaded document"
                        >
                          Preview
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={removeResume}
                        className="p-1.5 text-[#747878] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                        title="Remove attachment"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase text-xs font-semibold">
                  Cover Letter / Note
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Brief summary of your architectural background and design ethos..."
                  className="w-full bg-white border border-[#747878]/30 p-3 text-sm text-[#000000] focus:ring-1 focus:ring-[#000000] focus:border-[#000000] resize-none"
                />
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="p-4 sm:p-5 md:px-8 border-t border-[#747878]/15 bg-white flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-[#000000] text-[#000000] label-caps hover:bg-[#edeeef] text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#000000] text-white label-caps hover:bg-[#a33e00] text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

