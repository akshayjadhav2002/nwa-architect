import React, { useState } from 'react';
import { StudioSettings, TeamMember } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface AdminSettingsProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: StudioSettings) => void;
  onNavigate?: (view: 'dashboard' | 'projects' | 'jobs' | 'applications' | 'settings') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'team' | 'security'>('profile');

  // Form states for Studio Profile
  const [name, setName] = useState(settings.profile.name);
  const [regNum, setRegNum] = useState(settings.profile.registrationNumber);
  const [address, setAddress] = useState(settings.profile.hqAddress);
  const [email, setEmail] = useState(settings.profile.contactEmail);
  const [phone, setPhone] = useState(settings.profile.phoneNumber);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Team Management state
  const [team, setTeam] = useState<TeamMember[]>(settings.team || []);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Senior Architect');

  // Security
  const [twoFactor, setTwoFactor] = useState(settings.security?.twoFactorEnabled || false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      profile: {
        name,
        registrationNumber: regNum,
        hqAddress: address,
        contactEmail: email,
        phoneNumber: phone,
      },
      team,
      security: {
        twoFactorEnabled: twoFactor,
      },
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const initials = newMemberName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const newTm: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName,
      role: newMemberRole,
      status: 'Active',
      initials: initials || 'TM',
      email: newMemberEmail,
    };

    const updatedTeam = [...team, newTm];
    setTeam(updatedTeam);
    onUpdateSettings({
      ...settings,
      team: updatedTeam,
    });

    setNewMemberName('');
    setNewMemberEmail('');
    setInviteModalOpen(false);
  };

  const handleRemoveMember = (id: string) => {
    const updatedTeam = team.filter((t) => t.id !== id);
    setTeam(updatedTeam);
    onUpdateSettings({
      ...settings,
      team: updatedTeam,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Header */}
      <header className="px-6 md:px-20 py-8 border-b border-[#747878]/15 bg-[#f8f9fa] shrink-0">
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
          Studio Settings
        </h2>
        <p className="text-base text-[#444748]">
          Manage studio profile details, team members, and authentication preferences.
        </p>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-8 mt-8">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`label-caps pb-2 transition-colors ${
              activeSubTab === 'profile'
                ? 'text-[#000000] border-b-2 border-[#000000] font-bold'
                : 'text-[#444748] hover:text-[#000000]'
            }`}
          >
            Studio Profile
          </button>
          <button
            onClick={() => setActiveSubTab('team')}
            className={`label-caps pb-2 transition-colors ${
              activeSubTab === 'team'
                ? 'text-[#000000] border-b-2 border-[#000000] font-bold'
                : 'text-[#444748] hover:text-[#000000]'
            }`}
          >
            Team Management
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`label-caps pb-2 transition-colors ${
              activeSubTab === 'security'
                ? 'text-[#000000] border-b-2 border-[#000000] font-bold'
                : 'text-[#444748] hover:text-[#000000]'
            }`}
          >
            Account Security
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-20 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {savedFeedback && (
            <div className="p-4 bg-[#a33e00]/10 border border-[#a33e00] text-[#a33e00] label-caps text-sm">
              Studio settings saved successfully.
            </div>
          )}

          {/* SubTab 1: Studio Profile */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#000000]">
                  Studio Profile
                </h3>
                <p className="text-sm text-[#444748] mt-1">
                  General studio details and official registration information.
                </p>
              </div>

              <div className="flex flex-col">
                <label className="label-caps text-[#444748] mb-2 uppercase">
                  Studio Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-underline text-lg text-[#000000] py-2"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-caps text-[#444748] mb-2 uppercase">
                  AIA Registration Number
                </label>
                <input
                  type="text"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  className="input-underline text-base text-[#000000] py-2"
                />
              </div>

              <div className="flex flex-col">
                <label className="label-caps text-[#444748] mb-2 uppercase">
                  HQ Address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-[#747878]/20 p-3 text-base focus:border-[#000000] focus:ring-0 bg-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <label className="label-caps text-[#444748] mb-2 uppercase">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-underline text-base text-[#000000] py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="label-caps text-[#444748] mb-2 uppercase">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-underline text-base text-[#000000] py-2"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#000000] text-white label-caps px-8 py-3 hover:bg-[#a33e00] transition-colors uppercase"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {/* SubTab 2: Team Management */}
          {activeSubTab === 'team' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-[#747878]/15 pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#000000]">
                    Team Management
                  </h3>
                  <p className="text-sm text-[#444748] mt-1">
                    Manage studio partners, architects, and administration access.
                  </p>
                </div>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="bg-[#000000] text-white label-caps px-6 py-2.5 hover:bg-[#a33e00] transition-colors uppercase"
                >
                  + Invite Member
                </button>
              </div>

              <div className="divide-y divide-[#747878]/15">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#000000] text-white rounded-full flex items-center justify-center font-bold label-caps text-xs">
                        {member.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-base text-[#000000]">
                          {member.name}
                        </h4>
                        <p className="text-xs text-[#444748]">
                          {member.role} • {member.email || 'Active Admin'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="text-xs text-[#ba1a1a] hover:underline label-caps cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 3: Account Security */}
          {activeSubTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#000000]">
                  Account Security
                </h3>
                <p className="text-sm text-[#444748] mt-1">
                  Configure authentication policies and studio access protocols.
                </p>
              </div>

              <div className="p-6 bg-white border border-[#747878]/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-base text-[#000000]">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-[#444748]">
                      Require an authenticator app code when signing into the Studio Admin portal.
                    </p>
                  </div>
                  <button
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      twoFactor ? 'bg-[#000000]' : 'bg-[#e1e3e4]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        twoFactor ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#747878]/15 space-y-4">
                <h4 className="font-semibold text-base text-[#000000]">
                  Active Admin Sessions
                </h4>
                <div className="text-sm text-[#444748] flex justify-between items-center">
                  <span>Current Browser • Pune, MH, India</span>
                  <span className="label-caps text-emerald-700 text-xs font-bold">Active Now</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f8f9fa] w-full max-w-md border border-[#747878]/30 p-8 shadow-2xl relative">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-4 right-4 text-[#000000] hover:text-[#a33e00]"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#000000] mb-6">
              Invite Team Member
            </h3>

            <form onSubmit={handleInviteMember} className="flex flex-col gap-6">
              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="input-underline text-base w-full py-2"
                />
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@nwa.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="input-underline text-base w-full py-2"
                />
              </div>

              <div>
                <label className="label-caps text-[#444748] block mb-2 uppercase">Role / Title</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="input-underline text-base w-full py-2 cursor-pointer"
                >
                  <option value="Senior Architect">Senior Architect</option>
                  <option value="Associate Principal">Associate Principal</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Studio Manager">Studio Manager</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-6 py-2.5 border border-[#000000] label-caps"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#000000] text-white label-caps hover:bg-[#a33e00] uppercase"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removing Team Member */}
      <ConfirmationModal
        isOpen={!!memberToRemove}
        title="Remove Team Member"
        message={
          memberToRemove ? (
            <p>
              Are you sure you want to remove{' '}
              <strong className="text-[#000000] font-semibold">{memberToRemove.name}</strong> (
              <span className="font-mono text-xs">{memberToRemove.role}</span>)?
              They will no longer have access to the studio administration portal.
            </p>
          ) : null
        }
        confirmLabel="Remove Member"
        onConfirm={() => {
          if (memberToRemove) {
            handleRemoveMember(memberToRemove.id);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
};
