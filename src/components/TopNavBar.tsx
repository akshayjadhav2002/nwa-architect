import React, { useState } from 'react';

interface TopNavBarProps {
  activeTab: 'portfolio' | 'about' | 'studio' | 'careers' | 'contact' | 'admin';
  onNavigate: (tab: 'portfolio' | 'about' | 'careers' | 'contact' | 'admin') => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ activeTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#f8f9fa] border-b border-[#747878]/15 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-4 flex justify-between items-center w-full">
        {/* Logo / Brand Name */}
        <button
          onClick={() => onNavigate('portfolio')}
          className="text-left focus:outline-none flex items-center gap-3 group"
        >
          <img
            src="/assets/nwaaritects_logo.jpg"
            alt="NWA Architects Logo"
            className="h-9 w-auto object-contain bg-white border border-[#747878]/20 p-0.5 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="font-serif text-2xl font-bold tracking-tight text-[#000000] group-hover:text-[#a33e00] transition-colors">
            NWA Architects
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <button
            onClick={() => onNavigate('portfolio')}
            className={`label-caps transition-colors duration-300 pb-1 ${
              activeTab === 'portfolio'
                ? 'text-[#a33e00] border-b border-[#a33e00] font-semibold'
                : 'text-[#444748] hover:text-[#a33e00]'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`label-caps transition-colors duration-300 pb-1 ${
              activeTab === 'about' || activeTab === 'studio'
                ? 'text-[#a33e00] border-b border-[#a33e00] font-semibold'
                : 'text-[#444748] hover:text-[#a33e00]'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => onNavigate('careers')}
            className={`label-caps transition-colors duration-300 pb-1 ${
              activeTab === 'careers'
                ? 'text-[#a33e00] border-b border-[#a33e00] font-semibold'
                : 'text-[#444748] hover:text-[#a33e00]'
            }`}
          >
            Careers
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`label-caps transition-colors duration-300 pb-1 ${
              activeTab === 'contact'
                ? 'text-[#a33e00] border-b border-[#a33e00] font-semibold'
                : 'text-[#444748] hover:text-[#a33e00]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Admin Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => onNavigate('admin')}
            className="bg-[#000000] text-white label-caps px-6 py-2.5 hover:bg-[#a33e00] transition-colors duration-300 uppercase tracking-widest"
          >
            Admin
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#000000] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f8f9fa] border-b border-[#747878]/20 px-6 py-6 flex flex-col gap-4">
          <button
            onClick={() => {
              onNavigate('portfolio');
              setMobileMenuOpen(false);
            }}
            className={`text-left label-caps py-2 ${
              activeTab === 'portfolio' ? 'text-[#a33e00] font-semibold' : 'text-[#191c1d]'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className={`text-left label-caps py-2 ${
              activeTab === 'about' || activeTab === 'studio' ? 'text-[#a33e00] font-semibold' : 'text-[#191c1d]'
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => {
              onNavigate('careers');
              setMobileMenuOpen(false);
            }}
            className={`text-left label-caps py-2 ${
              activeTab === 'careers' ? 'text-[#a33e00] font-semibold' : 'text-[#191c1d]'
            }`}
          >
            Careers
          </button>
          <button
            onClick={() => {
              onNavigate('contact');
              setMobileMenuOpen(false);
            }}
            className={`text-left label-caps py-2 ${
              activeTab === 'contact' ? 'text-[#a33e00] font-semibold' : 'text-[#191c1d]'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => {
              onNavigate('admin');
              setMobileMenuOpen(false);
            }}
            className="bg-[#000000] text-white label-caps py-3 text-center uppercase tracking-widest mt-2"
          >
            Admin Portal
          </button>
        </div>
      )}
    </header>
  );
};
