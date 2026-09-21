import React, { useState } from 'react';
import { JobPosting } from '../types';
import { ApplyModal } from '../components/ApplyModal';

interface CareersViewProps {
  jobs: JobPosting[];
  onSubmitApplication: (appData: {
    candidateName: string;
    email: string;
    position: string;
    portfolioUrl: string;
    coverLetter: string;
    resumeName?: string;
    resumeUrl?: string;
    experienceSummary?: Array<{
      role: string;
      company: string;
      period: string;
      description?: string;
    }>;
  }) => void;
}

export const CareersView: React.FC<CareersViewProps> = ({ jobs, onSubmitApplication }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All Roles');
  const [activeJobForApply, setActiveJobForApply] = useState<JobPosting | null>(null);

  const filters = ['All Roles', 'Architecture', 'Interior Design', 'Management'];

  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'Active') return false;
    if (selectedFilter === 'All Roles') return true;
    return job.department.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8 space-y-6">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#000000] tracking-tight leading-tight">
              Build the Future of Void & Structure.
            </h1>
            <p className="text-lg md:text-xl text-[#444748] max-w-2xl font-body">
              Join NWA Architects in crafting timeless permanence.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 border-t border-[#747878]/15">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#000000]">
              Open Positions
            </h2>
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-4 items-center">
            <span className="label-caps text-[#444748]">Filter:</span>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`label-caps pb-1 transition-colors ${
                  selectedFilter === f
                    ? 'text-[#000000] border-b border-[#000000] font-bold'
                    : 'text-[#444748] hover:text-[#000000]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="divide-y divide-[#747878]/15">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-[#444748]">
              No open positions match the selected filter.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <article
                key={job.id}
                className="group py-8 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-[#f3f4f5] transition-colors duration-300 px-4 md:px-6 -mx-4 md:-mx-6"
              >
                <div className="mb-4 md:mb-0 space-y-1">
                  <span className="label-caps text-[#444748] block">
                    {job.department} • {job.location}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#000000] group-hover:text-[#a33e00] transition-colors">
                    {job.title}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveJobForApply(job)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#000000] text-[#000000] label-caps hover:bg-[#a33e00] hover:text-white hover:border-[#a33e00] transition-all duration-300 uppercase shrink-0"
                >
                  Apply Now
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Studio Environment Bento Grid */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-8">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000]">
              The Studio Environment
            </h2>
            <p className="text-base md:text-lg text-[#444748] mt-4 max-w-xl">
              We foster a culture of intense focus and collaborative critique. Our studio is designed to remove friction from the creative process, allowing pure architectural thought to flourish.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-6">
          {/* Large Image Panel */}
          <div className="md:col-span-8 md:row-span-2 relative bg-[#e1e3e4] overflow-hidden group">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLvfdOA7-iFZuZbXcpSKwdIE3RXM_wJkyGNlPeyLqEJ4Nuyx1NUcUpU3bIkKMXdh46_JzDcpHpAskKclLYO0I3-fytfhWo4iHEDfCWGYb4JUmESGwiiq2hJO2f_DgXdzTy5RIKTK_bsSwdLESnqLfffZCZ_SCEKhqkcS_nXETEMzM5gwhKmvuKEEo_iq0hKKdF72o--rz-tp5FgbpsnEAFwLa8rzFy_lsMH2u3AY4paWIOBUI0aOrg0cqfLq"
              alt="Studio Interior"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="font-serif text-2xl md:text-4xl font-bold">
                Chhatrapati Square Workspace
              </h3>
            </div>
          </div>

          {/* Text Panel */}
          <div className="md:col-span-4 bg-[#edeeef] p-8 flex flex-col justify-center border border-[#747878]/15">
            <span className="material-symbols-outlined text-[#a33e00] text-4xl mb-4">
              lightbulb
            </span>
            <h4 className="font-serif text-2xl font-bold text-[#000000] mb-2">
              Architectural Excellence
            </h4>
            <p className="text-sm text-[#444748] leading-relaxed">
              Our studio integrates advanced structural engineering with timeless design principles to create spaces that endure.
            </p>
          </div>

          {/* Small Image Panel */}
          <div className="md:col-span-4 relative bg-[#e1e3e4] overflow-hidden group">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLtAJBeGOIMGk6R3tUQp36wnju1dGJ5XO5bHlxuWGLmslLyZnjWN9oJqk__OrPWthZfdmTljxbxd2jCMxRy637Lu5ieu58l4ODs-OpJ7HDeaYdH5_q6__gXobH9steeuNBG1ygIQM3cysYF7KSYPxlcDcptPcFwD9yKJM-4lNs859UpewH0N0gx4_VKARBr2cRvrKVwL147hc-Z_18iFOIAX_k102-NwIbfl5KAyJu70V_qem7VGuZx2TNE"
              alt="Architectural Model"
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      <ApplyModal
        job={activeJobForApply}
        onClose={() => setActiveJobForApply(null)}
        onSubmitApplication={onSubmitApplication}
      />
    </main>
  );
};
