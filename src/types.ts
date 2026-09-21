export interface Project {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Cultural' | 'Institutional' | 'Urban Planning' | 'Healthcare' | 'Office';
  location: string;
  year: number;
  description: string;
  imageUrl: string;
  status: 'In Progress' | 'Concept Phase' | 'Completed';
  lastEdited: string;
  editedBy: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: 'Design' | 'Architecture' | 'Interior Design' | 'Interiors' | 'Management' | 'Engineering';
  location: string;
  status: 'Active' | 'Draft' | 'Archived';
  postedDate: string;
  description?: string;
  requirements?: string[];
}

export interface Application {
  id: string;
  candidateName: string;
  position: string;
  appliedDate: string;
  status: 'Reviewing' | 'New' | 'Rejected' | 'Interview' | 'Hired';
  email: string;
  portfolioUrl: string;
  avatarUrl?: string;
  experienceSummary: Array<{
    role: string;
    company: string;
    period: string;
    description?: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size?: string;
    storageType?: 'bucket' | 'local' | 'cloud_sql';
    uploadedAt?: string;
  }>;
  notes: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  initials: string;
  email?: string;
}

export interface StudioProfile {
  name: string;
  logoUrl?: string;
  registrationNumber: string;
  hqAddress: string;
  contactEmail: string;
  phoneNumber: string;
}

export interface StudioSettings {
  profile: StudioProfile;
  team: TeamMember[];
  security: {
    twoFactorEnabled: boolean;
  };
}
