import React from 'react';

export type AdminView = 'dashboard' | 'projects' | 'jobs' | 'applications' | 'inquiries' | 'settings';

interface SideNavBarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  onExitAdmin: () => void;
  inquiriesCount?: number;
  currentUser?: {
    name?: string;
    email?: string;
  } | null;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentView,
  onNavigate,
  onExitAdmin,
  inquiriesCount,
  currentUser,
}) => {
  const displayIdentifier =
    currentUser?.name ||
    currentUser?.email ||
    sessionStorage.getItem('nwa_admin_user_name') ||
    sessionStorage.getItem('nwa_admin_user_email') ||
    'admin@nwa.com';

  return (
    <nav className="hidden md:flex flex-col bg-[#f3f4f5] border-r border-[#747878]/15 w-64 h-screen shrink-0 sticky top-0 py-8 px-4 justify-between z-40">
      <div>
        {/* Brand / Title Header */}
        <div className="mb-10 px-4">
          <div className="mb-2 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <span className="material-symbols-outlined text-2xl text-[#000000]">domain</span>
            <h1 className="font-serif text-lg font-bold text-[#000000] tracking-tight">
              Studio Admin
            </h1>
          </div>
          <p className="label-caps text-[10px] text-[#444748] opacity-70 uppercase tracking-widest">
            Management Portal
          </p>
        </div>

        {/* Navigation Items */}
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => onNavigate('projects')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded text-left transition-all ${
                currentView === 'projects'
                  ? 'text-[#000000] font-bold bg-[#e7e8e9]'
                  : 'text-[#444748] hover:bg-[#edeeef]'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentView === 'projects' ? "'FILL' 1" : "'FILL' 0" }}>
                architecture
              </span>
              <span className="label-caps">Projects</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('jobs')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded text-left transition-all ${
                currentView === 'jobs'
                  ? 'text-[#000000] font-bold bg-[#e7e8e9]'
                  : 'text-[#444748] hover:bg-[#edeeef]'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentView === 'jobs' ? "'FILL' 1" : "'FILL' 0" }}>
                work
              </span>
              <span className="label-caps">Job Postings</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('applications')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded text-left transition-all ${
                currentView === 'applications'
                  ? 'text-[#000000] font-bold bg-[#e7e8e9]'
                  : 'text-[#444748] hover:bg-[#edeeef]'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentView === 'applications' ? "'FILL' 1" : "'FILL' 0" }}>
                description
              </span>
              <span className="label-caps">Applications</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('inquiries')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded text-left transition-all ${
                currentView === 'inquiries'
                  ? 'text-[#000000] font-bold bg-[#e7e8e9]'
                  : 'text-[#444748] hover:bg-[#edeeef]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentView === 'inquiries' ? "'FILL' 1" : "'FILL' 0" }}>
                  mail
                </span>
                <span className="label-caps">Inquiries</span>
              </div>
              {typeof inquiriesCount === 'number' && inquiriesCount > 0 && (
                <span className="text-[10px] bg-[#a33e00] text-white font-bold px-1.5 py-0.5 rounded-full">
                  {inquiriesCount}
                </span>
              )}
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded text-left transition-all ${
                currentView === 'settings'
                  ? 'text-[#000000] font-bold bg-[#e7e8e9]'
                  : 'text-[#444748] hover:bg-[#edeeef]'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentView === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>
                settings
              </span>
              <span className="label-caps">Settings</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Footer Area with dynamically logged in username */}
      <div className="px-4 pt-6 border-t border-[#747878]/15 flex flex-col gap-4">
        <p className="text-[12px] text-[#191c1d] font-medium truncate flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">{displayIdentifier}</span>
        </p>

        <button
          onClick={onExitAdmin}
          className="flex items-center gap-3 text-[#444748] hover:text-[#000000] label-caps w-full text-left transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
};
