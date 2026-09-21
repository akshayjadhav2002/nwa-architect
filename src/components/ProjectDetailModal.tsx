import React from 'react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f8f9fa] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#747878]/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#000000] hover:text-[#a33e00] transition-colors p-2 z-10"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        {/* Hero Image */}
        <div className="w-full h-80 md:h-[450px] overflow-hidden relative">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="label-caps text-white/80 block mb-2">
              {project.category} • {project.year} • {project.location}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">{project.title}</h2>
          </div>
        </div>

        {/* Project Meta & Description */}
        <div className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-[#747878]/20">
            <div>
              <span className="label-caps text-[#444748] block mb-1">Category</span>
              <p className="font-semibold text-[#000000]">{project.category}</p>
            </div>
            <div>
              <span className="label-caps text-[#444748] block mb-1">Location</span>
              <p className="font-semibold text-[#000000]">{project.location}</p>
            </div>
            <div>
              <span className="label-caps text-[#444748] block mb-1">Status</span>
              <p className="font-semibold text-[#a33e00]">{project.status}</p>
            </div>
          </div>

          <div>
            <h3 className="label-caps text-[#000000] mb-4 uppercase tracking-widest border-b border-[#747878]/10 pb-2">
              Architectural Concept & Brief
            </h3>
            <p className="text-lg text-[#191c1d] leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#000000] text-white label-caps px-8 py-3 hover:bg-[#a33e00] transition-colors uppercase"
            >
              Close Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
