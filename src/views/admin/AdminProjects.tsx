import React, { useState, useRef } from 'react';
import { Project } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface AdminProjectsProps {
  projects: Project[];
  onAddProject: (p: Omit<Project, 'id' | 'lastEdited' | 'editedBy'>) => void;
  onUpdateProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onNavigate?: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'settings') => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onNavigate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Project['category']>('Residential');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<Project['status']>('In Progress');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [featuredWarning, setFeaturedWarning] = useState<string>('');
  const [saveFeedback, setSaveSubmitted] = useState(false);

  // Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  const featuredCount = projects.filter((p) => p.isFeatured).length;

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Residential');
    setLocation('');
    setYear(new Date().getFullYear());
    setDescription('');
    setImageUrl('');
    setStatus('In Progress');
    setIsFeatured(false);
    setFeaturedWarning('');
    setUploadError('');
    setUploadFileName('');
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setLocation(p.location);
    setYear(p.year);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setStatus(p.status);
    setIsFeatured(Boolean(p.isFeatured));
    setFeaturedWarning('');
    setUploadError('');
    setUploadFileName('');
  };

  const processUploadedFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds the 20MB limit. Please upload a smaller image.');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setUploadFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              dataUrl: base64Data,
              category: 'project',
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Server upload failed');
          }

          const data = await res.json();
          if (data.url) {
            setImageUrl(data.url);
          } else {
            setImageUrl(base64Data);
          }
        } catch (serverErr: any) {
          console.warn('Backend upload returned error, applying client preview fallback:', serverErr);
          // Fallback to client base64 preview so user never loses work
          setImageUrl(base64Data);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read image file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File upload processing error:', err);
      setUploadError(err.message || 'Error processing file.');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleToggleFeatured = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeFeatured = !project.isFeatured;
    if (willBeFeatured && featuredCount >= 5) {
      setFeaturedWarning('Maximum 5 featured projects allowed on the home screen carousel. Please unfeature another project first.');
      setTimeout(() => setFeaturedWarning(''), 5000);
      return;
    }
    setFeaturedWarning('');
    onUpdateProject({
      ...project,
      isFeatured: willBeFeatured,
      lastEdited: 'Just now',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const defaultImg = imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

    if (editingId) {
      const existing = projects.find((p) => p.id === editingId);
      if (existing) {
        onUpdateProject({
          ...existing,
          title,
          category,
          location,
          year,
          description,
          imageUrl: defaultImg,
          status,
          isFeatured,
          lastEdited: 'Just now',
          editedBy: 'Admin',
        });
      }
    } else {
      onAddProject({
        title,
        category,
        location: location || 'Pune, India',
        year,
        description,
        imageUrl: defaultImg,
        status,
        isFeatured,
      });
    }

    setSaveSubmitted(true);
    setTimeout(() => {
      setSaveSubmitted(false);
      resetForm();
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-6 md:px-20 py-8 border-b border-[#747878]/15 shrink-0 bg-[#f8f9fa] gap-4">
        <div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="md:hidden inline-flex items-center gap-1.5 text-xs label-caps font-bold text-[#a33e00] hover:text-[#000000] mb-2 transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          )}
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#000000] mb-2">
            Project Management
          </h2>
          <p className="text-sm md:text-base text-[#444748]">
            Add new architectural works or manage existing portfolio items.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[#000000] text-white label-caps px-6 py-3 hover:bg-[#a33e00] transition-colors duration-300 uppercase tracking-widest"
        >
          {editingId ? 'Update Project' : 'Save Project'}
        </button>
      </header>

      {/* Main Form + List Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-20 py-12">
        <div className="grid grid-cols-12 gap-8 max-w-[1440px] mx-auto">
          {/* Left Column: Form */}
          <div className="col-span-12 lg:col-span-7 pr-0 lg:pr-8">
            <div className="flex justify-between items-center mb-8 border-b border-[#747878]/15 pb-4">
              <h3 className="label-caps text-[#000000] font-bold text-sm">
                01 / Project Details {editingId && '(Editing Mode)'}
              </h3>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-[#a33e00] hover:underline uppercase label-caps"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {saveFeedback && (
              <div className="mb-6 p-4 bg-[#a33e00]/10 border border-[#a33e00] text-[#a33e00] text-sm label-caps">
                Project saved successfully!
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-8">
              <div className="flex flex-col">
                <label htmlFor="p-title" className="label-caps text-[#444748] mb-2">
                  Project Title
                </label>
                <input
                  id="p-title"
                  type="text"
                  required
                  placeholder="e.g., The Glass Pavilion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-underline text-lg text-[#000000] py-2 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label htmlFor="p-cat" className="label-caps text-[#444748] mb-2">
                    Category
                  </label>
                  <select
                    id="p-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Project['category'])}
                    className="input-underline text-base text-[#000000] py-2 focus:ring-0 cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Office">Office</option>
                    <option value="Urban Planning">Urban Planning</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="p-loc" className="label-caps text-[#444748] mb-2">
                    Location
                  </label>
                  <input
                    id="p-loc"
                    type="text"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-underline text-base text-[#000000] py-2 focus:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label htmlFor="p-year" className="label-caps text-[#444748] mb-2">
                    Completion Year
                  </label>
                  <input
                    id="p-year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="input-underline text-base text-[#000000] py-2 focus:ring-0"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="p-status" className="label-caps text-[#444748] mb-2">
                    Status
                  </label>
                  <select
                    id="p-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    className="input-underline text-base text-[#000000] py-2 focus:ring-0 cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Concept Phase">Concept Phase</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="p-desc" className="label-caps text-[#444748] mb-4">
                  Project Description
                </label>
                <textarea
                  id="p-desc"
                  rows={5}
                  placeholder="Detail the architectural concept, materials used, and client brief..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#747878]/20 rounded-sm p-4 text-base focus:border-[#000000] focus:ring-0 bg-transparent resize-none"
                />
              </div>

              {/* Featured Project Toggle on Home Screen Carousel */}
              <div className="p-5 bg-white border border-[#747878]/20 rounded-sm shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      id="p-featured"
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const isCurrentAlreadyFeatured = editingId
                          ? Boolean(projects.find((p) => p.id === editingId)?.isFeatured)
                          : false;

                        if (checked && featuredCount >= 5 && !isCurrentAlreadyFeatured) {
                          setFeaturedWarning(
                            'Maximum 5 featured projects allowed simultaneously on the home screen carousel. Please unfeature another project before featuring this one.'
                          );
                          return;
                        }
                        setFeaturedWarning('');
                        setIsFeatured(checked);
                      }}
                      className="mt-1 h-4 w-4 rounded-xs border-[#747878]/40 text-[#a33e00] focus:ring-[#a33e00] cursor-pointer"
                    />
                    <label htmlFor="p-featured" className="cursor-pointer select-none">
                      <span className="label-caps font-bold text-sm text-[#000000] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#a33e00]">star</span>
                        <span>Feature this Project on Home Screen Carousel</span>
                      </span>
                      <p className="text-xs text-[#444748] mt-1 leading-relaxed">
                        Featured projects auto-slide dynamically on the main website hero carousel and appear in the "Featured" works tab (Strict maximum of 5 projects).
                      </p>
                    </label>
                  </div>

                  <span
                    className={`label-caps text-[11px] px-2.5 py-1 font-bold shrink-0 rounded-xs border ${
                      featuredCount >= 5
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-[#f3f4f5] text-[#191c1d] border-[#747878]/20'
                    }`}
                  >
                    Featured: {featuredCount}/5
                  </span>
                </div>

                {featuredWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fade-in rounded-xs">
                    <span className="material-symbols-outlined text-base text-amber-700 shrink-0">warning</span>
                    <span>{featuredWarning}</span>
                  </div>
                )}
              </div>

              <h3 className="label-caps text-[#000000] font-bold text-sm mt-8 border-b border-[#747878]/15 pb-4">
                02 / Media Assets
              </h3>

              {/* Image URL Input & Dropzone */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="p-img" className="label-caps text-[#444748]">
                      Image Asset URL or Direct Upload
                    </label>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (imageUrl.startsWith('/uploads/') || imageUrl.includes('vercel-storage')) {
                            fetch('/api/storage/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: imageUrl }),
                            }).catch(() => {});
                          }
                          setImageUrl('');
                          setUploadFileName('');
                        }}
                        className="text-xs text-[#ba1a1a] hover:underline label-caps cursor-pointer"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>
                  <input
                    id="p-img"
                    type="url"
                    placeholder="Paste image URL (https://...) or upload directly below"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input-underline text-sm text-[#000000] py-2 focus:ring-0"
                  />
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Interactive Dropzone & File Chooser Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#000000] bg-[#e1e3e4] scale-[0.99]'
                      : 'border-[#747878]/30 hover:border-[#000000] bg-[#f3f4f5] hover:bg-[#ededee]'
                  } group`}
                >
                  {isUploading ? (
                    <div className="py-6 flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm font-semibold text-[#000000]">
                        Uploading {uploadFileName || 'image'} to server storage...
                      </p>
                      <p className="text-xs text-[#444748] mt-1">
                        Storing to backend file system & PostgreSQL schema
                      </p>
                    </div>
                  ) : imageUrl ? (
                    <div className="w-full space-y-4">
                      <div className="w-full h-48 max-h-56 overflow-hidden relative rounded-sm border border-[#747878]/20 bg-black/5">
                        <img
                          src={imageUrl}
                          alt="Project preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
                        <div className="flex items-center gap-1.5 text-[#444748] truncate max-w-[280px]">
                          <span className="material-symbols-outlined text-base text-emerald-600">
                            check_circle
                          </span>
                          <span className="truncate font-mono">
                            {imageUrl.startsWith('/uploads/')
                              ? `Server: ${imageUrl.split('/').pop()}`
                              : imageUrl.startsWith('data:')
                              ? 'Locally Loaded Image'
                              : imageUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 bg-[#000000] text-white text-[11px] label-caps font-bold uppercase hover:bg-[#a33e00] transition-colors"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (imageUrl.startsWith('/uploads/') || imageUrl.includes('vercel-storage')) {
                                fetch('/api/storage/delete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ url: imageUrl }),
                                }).catch(() => {});
                              }
                              setImageUrl('');
                              setUploadFileName('');
                            }}
                            className="px-3 py-1.5 bg-[#edeeef] text-[#ba1a1a] text-[11px] label-caps font-bold uppercase hover:bg-[#ba1a1a] hover:text-white transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#e1e3e4] flex items-center justify-center mb-3 group-hover:bg-[#000000] transition-colors">
                        <span className="material-symbols-outlined text-2xl text-[#444748] group-hover:text-white transition-colors">
                          cloud_upload
                        </span>
                      </div>
                      <p className="text-base font-semibold text-[#000000] mb-1">
                        Click to browse or drag & drop project image
                      </p>
                      <p className="label-caps text-[#444748] text-[11px] tracking-wider">
                        Supports PNG, JPG, WEBP, SVG, GIF (Up to 20MB)
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#747878]/20 text-[11px] label-caps font-bold text-[#000000] group-hover:border-[#000000]">
                        <span className="material-symbols-outlined text-sm">folder_open</span>
                        <span>Open File Dialog</span>
                      </div>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-600">error</span>
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Existing Portfolio Archive List */}
          <div className="col-span-12 lg:col-span-5 pl-0 lg:pl-8 lg:border-l border-[#747878]/15 mt-12 lg:mt-0">
            <div className="flex justify-between items-end mb-8 border-b border-[#747878]/15 pb-4">
              <div>
                <h3 className="label-caps text-[#000000] font-bold text-sm">
                  Portfolio Archive
                </h3>
                <p className="text-[11px] text-[#747878] mt-0.5">
                  ⭐ <span className="font-semibold text-[#000000]">{featuredCount}/5</span> Featured in Home Carousel
                </p>
              </div>
              <span className="label-caps text-[#444748]">
                {projects.length} Projects
              </span>
            </div>

            <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 bg-white border rounded-sm transition-all overflow-hidden ${
                    editingId === project.id
                      ? 'border-[#a33e00] ring-1 ring-[#a33e00]'
                      : 'border-[#747878]/15 hover:border-[#000000]/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e1e3e4] rounded-sm overflow-hidden shrink-0 border border-[#747878]/15 relative">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover filter grayscale opacity-80 hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      {project.isFeatured && (
                        <div className="absolute top-1 left-1 bg-[#000000] text-amber-400 p-0.5 rounded-full shadow-xs flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px]">star</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#000000] truncate block" title={project.title}>
                          {project.title}
                        </h4>
                        {project.isFeatured && (
                          <span className="label-caps text-[9px] px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-200 font-bold uppercase tracking-wider shrink-0 rounded-xs">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="label-caps text-[#444748] text-[10px] mt-0.5 truncate">
                        {project.category} • {project.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFeatured(project, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors cursor-pointer ${
                        project.isFeatured
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-[#747878] hover:text-[#000000] hover:bg-[#f3f4f5]'
                      }`}
                      title={project.isFeatured ? 'Unfeature project' : 'Feature project (Max 5)'}
                    >
                      <span className={`material-symbols-outlined text-base ${project.isFeatured ? 'fill-current' : ''}`}>
                        {project.isFeatured ? 'star' : 'star_border'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="w-8 h-8 flex items-center justify-center text-[#444748] hover:text-[#000000] hover:bg-[#f3f4f5] rounded-sm transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      className="w-8 h-8 flex items-center justify-center text-[#444748] hover:text-[#ba1a1a] hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Project Deletion */}
      <ConfirmationModal
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={
          projectToDelete ? (
            <p>
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#000000] font-semibold">{projectToDelete.title}</strong> (
              <span className="font-mono text-xs">{projectToDelete.category}, {projectToDelete.year}</span>)?
              This will remove the project from the public portfolio and archive.
            </p>
          ) : null
        }
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            if (editingId === projectToDelete.id) {
              resetForm();
            }
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
