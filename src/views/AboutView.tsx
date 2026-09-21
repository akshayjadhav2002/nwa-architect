import React from 'react';

interface AboutViewProps {
  onNavigate: (tab: 'portfolio' | 'about' | 'careers' | 'contact' | 'admin') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
      {/* Hero / Intro Header */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-[#747878]/15 pb-16">
        <div className="md:col-span-5">
          <div className="mb-5 inline-block bg-white p-2 border border-[#747878]/20 shadow-sm">
            <img
              src="/assets/nwaaritects_logo.jpg"
              alt="NWA Architects Logo"
              className="h-12 md:h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="label-caps text-[#a33e00] font-bold uppercase tracking-widest block mb-3">
            Since 2002
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#000000] leading-tight mb-4">
            About NWA Architects
          </h1>
          <p className="text-base text-[#444748] font-sans">
            Leading Architectural Firm for Institutional, Industrial, Commercial & Residential Developments
          </p>
        </div>

        <div className="md:col-span-7 space-y-6">
          <p className="text-lg md:text-xl text-[#191c1d] leading-relaxed font-serif font-medium border-l-2 border-[#a33e00] pl-6 py-1">
            Founded in 2002, NWA Architects has emerged as a leading architectural firm that plays a major role in a wide range of projects. With a strong focus on institutional, industrial, hospitals, resorts, commercial, and residential developments, we have built a reputation for delivering exceptional designs and outstanding results.
          </p>
          <p className="text-base text-[#444748] leading-relaxed">
            At NWA Architects, we bring together a team of skilled professionals with diverse expertise, allowing us to tackle projects of varying complexities and scales. Whether it's designing cutting-edge industrial facilities, creating functional and inspiring hospital spaces, or crafting luxurious resorts, our architects possess the knowledge and creativity to meet the unique requirements of each project.
          </p>
        </div>
      </section>

      {/* Key Sectors & Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-b border-[#747878]/15 pb-16">
        <div className="p-6 bg-white border border-[#747878]/20">
          <span className="material-symbols-outlined text-3xl text-[#a33e00] mb-3 block">history_edu</span>
          <h3 className="font-serif text-3xl font-bold text-[#000000]">2002</h3>
          <p className="label-caps text-xs text-[#444748] uppercase tracking-wider mt-1">Established Firm</p>
        </div>
        <div className="p-6 bg-white border border-[#747878]/20">
          <span className="material-symbols-outlined text-3xl text-[#a33e00] mb-3 block">domain</span>
          <h3 className="font-serif text-3xl font-bold text-[#000000]">6+</h3>
          <p className="label-caps text-xs text-[#444748] uppercase tracking-wider mt-1">Core Specializations</p>
        </div>
        <div className="p-6 bg-white border border-[#747878]/20">
          <span className="material-symbols-outlined text-3xl text-[#a33e00] mb-3 block">apartment</span>
          <h3 className="font-serif text-3xl font-bold text-[#000000]">100+</h3>
          <p className="label-caps text-xs text-[#444748] uppercase tracking-wider mt-1">Completed Developments</p>
        </div>
        <div className="p-6 bg-white border border-[#747878]/20">
          <span className="material-symbols-outlined text-3xl text-[#a33e00] mb-3 block">verified</span>
          <h3 className="font-serif text-3xl font-bold text-[#000000]">100%</h3>
          <p className="label-caps text-xs text-[#444748] uppercase tracking-wider mt-1">Commitment to Quality</p>
        </div>
      </section>

      {/* Detailed Firm Overview & Philosophy */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-[#747878]/15 pb-16">
        <div className="md:col-span-5 order-2 md:order-1">
          <div className="aspect-[4/3] bg-[#f3f4f5] overflow-hidden border border-[#747878]/20 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
              alt="NWA Architectural Office and Design Work"
              className="w-full h-full object-cover grayscale contrast-125"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="md:col-span-7 order-1 md:order-2 space-y-6">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000]">
            Our Architectural Approach
          </h2>

          <p className="text-base text-[#191c1d] leading-relaxed">
            We believe in a collaborative approach, working closely with clients to understand their vision, objectives, and constraints. Our architects blend their technical proficiency, innovative thinking, and extensive experience to design spaces that not only meet the functional needs but also inspire and leave a lasting impression.
          </p>

          <p className="text-base text-[#444748] leading-relaxed">
            With an unwavering commitment to excellence, NWA Architects takes pride in delivering projects that exceed expectations. From concept to completion, we pay meticulous attention to every detail, ensuring that the final outcome reflects our clients' aspirations while adhering to the highest standards of quality, sustainability, and functionality.
          </p>

          <p className="text-base text-[#444748] leading-relaxed">
            Over the years, NWA Architects has successfully completed numerous projects, earning the trust and satisfaction of our clients. We continue to push the boundaries of design, embracing innovation and embracing the latest industry trends to deliver spaces that stand the test of time.
          </p>
        </div>
      </section>

      {/* Specialization Matrix */}
      <section className="border-b border-[#747878]/15 pb-16">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="label-caps text-[#a33e00] font-bold uppercase tracking-widest block mb-2">
            Diverse Capabilities
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#000000]">
            Sectors We Transform
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">account_balance</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Institutional</h3>
            <p className="text-sm text-[#444748]">Educational, civic, and public sector infrastructure built for longevity.</p>
          </div>

          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">factory</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Industrial</h3>
            <p className="text-sm text-[#444748]">Cutting-edge manufacturing, logistics, and technology complexes.</p>
          </div>

          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">local_hospital</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Hospitals & Healthcare</h3>
            <p className="text-sm text-[#444748]">Functional, healing, and inspiring healthcare facility environments.</p>
          </div>

          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">beach_access</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Resorts & Hospitality</h3>
            <p className="text-sm text-[#444748]">Luxurious retreat spaces integrated seamlessly into natural landscapes.</p>
          </div>

          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">storefront</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Commercial</h3>
            <p className="text-sm text-[#444748]">Modern office towers, retail hubs, and multi-use urban developments.</p>
          </div>

          <div className="p-6 bg-white border border-[#747878]/20 space-y-2">
            <span className="material-symbols-outlined text-2xl text-[#a33e00]">home_pin</span>
            <h3 className="font-serif text-xl font-bold text-[#000000]">Residential</h3>
            <p className="text-sm text-[#444748]">Bespoke private estates, luxury villas, and multi-family residences.</p>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="border-b border-[#747878]/15 pb-16">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="label-caps text-[#a33e00] font-bold uppercase tracking-widest block mb-2">
            Professional Practice
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000]">
            Our Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white border border-[#747878]/20 space-y-4 hover:border-[#a33e00] transition-colors group">
            <div className="w-12 h-12 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center group-hover:bg-[#a33e00] group-hover:text-white group-hover:border-[#a33e00] transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#a33e00] group-hover:text-white">
                architecture
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#000000]">
              Building Design
            </h3>
            <p className="text-base text-[#444748] leading-relaxed">
              Introducing NWA Architects, where visionary building design comes to life. Our experienced team is dedicated to transforming your vision into reality, creating inspiring spaces.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#747878]/20 space-y-4 hover:border-[#a33e00] transition-colors group">
            <div className="w-12 h-12 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center group-hover:bg-[#a33e00] group-hover:text-white group-hover:border-[#a33e00] transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#a33e00] group-hover:text-white">
                engineering
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#000000]">
              Periodic Site Supervisions
            </h3>
            <p className="text-base text-[#444748] leading-relaxed">
              Welcome to NWA Architects, your trusted partner for comprehensive site supervision services. With our experienced team of architects, we are committed to ensuring that your construction project is executed to the highest standards.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#747878]/20 space-y-4 hover:border-[#a33e00] transition-colors group">
            <div className="w-12 h-12 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center group-hover:bg-[#a33e00] group-hover:text-white group-hover:border-[#a33e00] transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#a33e00] group-hover:text-white">
                verified_user
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#000000]">
              Statutory Compliances
            </h3>
            <p className="text-base text-[#444748] leading-relaxed">
              Welcome to NWA Architects, where we prioritize statutory compliance for your building projects. Our experienced team ensures that your designs adhere to all necessary regulations.
            </p>
          </div>

          <div className="p-8 bg-white border border-[#747878]/20 space-y-4 hover:border-[#a33e00] transition-colors group">
            <div className="w-12 h-12 bg-[#f3f4f5] border border-[#747878]/20 flex items-center justify-center group-hover:bg-[#a33e00] group-hover:text-white group-hover:border-[#a33e00] transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#a33e00] group-hover:text-white">
                request_quote
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#000000]">
              Estimate, Bill Checking & Tendering
            </h3>
            <p className="text-base text-[#444748] leading-relaxed">
              Welcome to NWA Architects, your trusted partner for professional bill checking services. We understand the importance of accurate and fair financial transactions in your construction project.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-[#000000] text-white p-8 md:p-14 text-center space-y-6">
        <h2 className="font-serif text-2xl md:text-4xl font-bold max-w-3xl mx-auto leading-relaxed">
          Choose NWA Architects for your next project.
        </h2>
        <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto font-sans leading-relaxed">
          Experience the difference of working with a dedicated team that is passionate about bringing your vision to life.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('contact')}
            className="bg-white text-[#000000] hover:bg-[#a33e00] hover:text-white label-caps px-8 py-4 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            Get In Touch
          </button>
        </div>
      </section>
    </main>
  );
};
