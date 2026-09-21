import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#000000] text-white w-full py-16 px-6 md:px-20 mt-auto">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/assets/nwaaritects_logo.jpg"
              alt="NWA Architects Logo"
              className="h-10 w-auto object-contain bg-white p-1 border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div className="font-serif text-3xl md:text-4xl font-bold text-white">
              NWA Architects
            </div>
          </div>
          <p className="text-sm text-white/70">
            © 2024 NWA Architectural Studio. All Rights Reserved.
          </p>
        </div>

        <div className="md:col-span-6 flex flex-col md:items-end justify-between gap-6">
          <nav className="flex flex-wrap gap-6">
            <a href="#" className="label-caps text-white/70 hover:text-white transition-opacity uppercase">
              Instagram
            </a>
            <a href="#" className="label-caps text-white/70 hover:text-white transition-opacity uppercase">
              LinkedIn
            </a>
            <a href="#" className="label-caps text-white/70 hover:text-white transition-opacity uppercase">
              Press
            </a>
            <a href="#" className="label-caps text-white/70 hover:text-white transition-opacity uppercase">
              Privacy
            </a>
          </nav>

          <p className="text-xs text-white/60 label-caps tracking-wider">
            Designed and Developed by <span className="text-white font-semibold">Akshay Jadhav</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
