import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { ProjectDetailModal } from '../components/ProjectDetailModal';

interface PortfolioViewProps {
  projects: Project[];
  onNavigate: (tab: 'portfolio' | 'studio' | 'careers' | 'contact' | 'admin') => void;
}

const HERO_SLIDES = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPYVOzwOCM0sV9yhgAQHqhODVTKuCbr7uYzcUxMivw7K2MVZYrEuBkd8u_IUDnJ7FbOSSyDUqZ934XiICOZhWXHRvmulPn0uq59awdwYmcZ-P9q_FbYEPvuFBnyQjQEjZYPhJr-U6-XbyqRDD5VlANZwAxGbUiJEQIt54aIKRjs5CVNR04qJtX5EsRONMnwG0eMPQfN1rHXUtqQOFMsUHyO-4Isd142bByvz6xYjPijt8RHPY4ISPBsA',
    headline: 'Designing permanence through minimal intervention.',
    subtitle: 'Brutalist Monolith • Kyoto',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvfdOA7-iFZuZbXcpSKwdIE3RXM_wJkyGNlPeyLqEJ4Nuyx1NUcUpU3bIkKMXdh46_JzDcpHpAskKclLYO0I3-fytfhWo4iHEDfCWGYb4JUmESGwiiq2hJO2f_DgXdzTy5RIKTK_bsSwdLESnqLfffZCZ_SCEKhqkcS_nXETEMzM5gwhKmvuKEEo_iq0hKKdF72o--rz-tp5FgbpsnEAFwLa8rzFy_lsMH2u3AY4paWIOBUI0aOrg0cqfLq',
    headline: 'Ethereal lightwells intersecting structural concrete.',
    subtitle: 'Chhatrapati Square • Commercial',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLtAJBeGOIMGk6R3tUQp36wnju1dGJ5XO5bHlxuWGLmslLyZnjWN9oJqk__OrPWthZfdmTljxbxd2jCMxRy637Lu5ieu58l4ODs-OpJ7HDeaYdH5_q6__gXobH9steeuNBG1ygIQM3cysYF7KSYPxlcDcptPcFwD9yKJM-4lNs859UpewH0N0gx4_VKARBr2cRvrKVwL147hc-Z_18iFOIAX_k102-NwIbfl5KAyJu70V_qem7VGuZx2TNE',
    headline: 'Local stone masonry woven with climate-responsive voids.',
    subtitle: 'Ale Vividh Cultural Society • Pune',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLvCFrBfgiwBT4W77ASsTXCZDCORfvPoHpPw7duaHOQ3t2phIiXtfy_5WNEee21q2agHYmEO54PpWjzz5mCSz-2DRrejgVDmIT8ygRZ15lV9fkgi1T0ZmV7RgcKGa0Fq_VxRI1mDWzEHmn2mOW4I3gXxlhAo5spHm83OkCE5Fl8UwmSVryWatEn8bmxxeX_N2VES6Q_WvyOLMYOEDVwizYZvL-KMFdSkEUlla06ksoZJphYhMvcciPB7xUop',
    headline: 'Sacred basalt geometry balancing light and shadow.',
    subtitle: 'Temple Sanctuary • Nashik',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida/AP1WRLsnPJA4XVPqDFnscjNik6aUz42R6MqPdwNHEDnEGRxKeXzaEajr-HGpLXaZ_O7QbbA2I2dyjNIyrzaozUnRdeebkrIB1TG8KIEoL3d_dUrIfox4NVxl9vfDK54IhyGMAii9XS76DPiYj58b842H1YYPYrvDe2MxovHC9bpvEM3Vwc-kQkNrZmzizLAFqrdvS1Sg-qbQov3s2fgzQtBORzyzkKy28JnG2cFIEAsVj1-dktALyNPzM3GROGLo',
    headline: 'Vertical gardens and minimalist structural glazing.',
    subtitle: 'Jayram Heights • Mumbai',
  },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  // Derive up to 5 featured projects for the hero slider
  const featuredProjects = projects.filter((p) => p.isFeatured).slice(0, 5);

  const heroSlides = featuredProjects.length > 0
    ? featuredProjects.map((p) => ({
        id: p.id,
        image: p.imageUrl,
        headline: p.description && p.description.length > 10 ? p.description : `${p.title} — Architectural Works`,
        subtitle: `${p.title} • ${p.category} • ${p.location}`,
        project: p,
      }))
    : HERO_SLIDES.map((s, idx) => ({
        id: `default-${idx}`,
        image: s.image,
        headline: s.headline,
        subtitle: s.subtitle,
        project: projects[idx] || null,
      }));

  // Background Image Slider State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const categories = ['All', 'Residential', 'Commercial', 'Cultural', 'Institutional', 'Healthcare', 'Office'];

  // Reset slide index if slides length changes
  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  // Auto-play interval (every 3.5 seconds)
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, heroSlides.length]);

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  return (
    <main className="w-full">
      {/* Hero Section with Framer Motion Auto-Sliding Studio Highlights Crossfade */}
      <section
        className="w-full h-[85vh] min-h-[520px] relative flex items-center justify-center overflow-hidden group select-none bg-black"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Crossfading Background Image */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activeSlide.id + currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url("${activeSlide.image}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/40 backdrop-blur-[0.5px]" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Text Overlay with Framer Motion Animated Transitions */}
        <div className="relative z-10 max-w-[1440px] w-full px-6 md:px-20 flex flex-col gap-6 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + currentSlide}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5 max-w-5xl"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#a33e00] rounded-full animate-pulse shadow-sm" />
                <span className="label-caps text-xs tracking-widest text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                  <span>Featured Work Spotlight</span>
                  <span>•</span>
                  <span className="text-white/90">{activeSlide.subtitle}</span>
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance drop-shadow-md">
                {activeSlide.headline}
              </h1>

              {activeSlide.project && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveProjectModal(activeSlide.project)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-[#a33e00] text-white border border-white/30 hover:border-[#a33e00] backdrop-blur-md label-caps text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg group/btn"
                  >
                    <span>Explore Project Details</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">
                      arrow_forward
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Navigation Controls (Left & Right) */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-[#a33e00] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-70 group-hover:opacity-100 focus:outline-none cursor-pointer"
          aria-label="Previous Slide"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-[#a33e00] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-70 group-hover:opacity-100 focus:outline-none cursor-pointer"
          aria-label="Next Slide"
        >
          <span className="material-symbols-outlined text-2xl">chevron_right</span>
        </button>

        {/* Bottom Slide Indicators & Progress Bar */}
        <div className="absolute bottom-8 z-20 max-w-[1440px] w-full px-6 md:px-20 flex items-center justify-between text-white/90">
          {/* Slide Counter */}
          <div className="label-caps text-xs tracking-widest flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 border border-white/15 rounded-xs">
            <span className="text-amber-400 font-bold">0{currentSlide + 1}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/70">0{heroSlides.length}</span>
            <span className="text-white/30 pl-1">•</span>
            <span className="text-white/60 text-[10px] uppercase font-mono">Auto Sliding</span>
          </div>

          {/* Animated Indicator Bars */}
          <div className="flex items-center gap-2 sm:gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="relative h-1 focus:outline-none py-2 cursor-pointer"
                aria-label={`Go to slide ${idx + 1}`}
              >
                <div
                  className={`h-1.5 transition-all duration-500 rounded-xs ${
                    currentSlide === idx ? 'w-10 bg-[#a33e00]' : 'w-4 bg-white/40 hover:bg-white/70'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Works Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
        {/* Header & Filter Bar */}
        <div className="w-full mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#747878]/20 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[#a33e00] rounded-full" />
              <span className="label-caps text-xs uppercase font-bold text-[#a33e00] tracking-widest">
                Architectural Portfolio
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000] mb-4">
              Selected Works
            </h2>
            <p className="text-[#444748] text-base md:text-lg max-w-xl">
              A curated archive of our structural interventions, exploring the tension between mass and void.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 md:mt-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`label-caps pb-1 text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'text-[#a33e00] border-b-2 border-[#a33e00] font-bold'
                      : 'text-[#444748] hover:text-[#a33e00]'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white border border-[#747878]/15 p-12">
            <p className="font-serif text-2xl text-[#000000]">No projects found in this category</p>
            <p className="text-sm text-[#444748]">Try switching categories or view all projects.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-6 py-2.5 bg-[#000000] text-white label-caps uppercase text-xs hover:bg-[#a33e00] transition-colors"
            >
              View All Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {filteredProjects.map((project, index) => {
              // Asymmetric layout logic for gallery feel
              const isFirst = index === 0;
              const spanClass = isFirst
                ? 'md:col-span-12 h-[550px]'
                : index % 3 === 0
                ? 'md:col-span-8 h-[480px]'
                : 'md:col-span-4 h-[480px]';

              return (
                <div
                  key={project.id}
                  onClick={() => setActiveProjectModal(project)}
                  className={`${spanClass} group cursor-pointer relative overflow-hidden bg-[#e1e3e4] border border-[#747878]/10 transition-all duration-500 shadow-xs`}
                >
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="label-caps text-white/80 mb-2">
                        0{index + 1} / {project.category} / {project.year}
                      </p>
                      <h3 className="font-serif text-2xl md:text-4xl font-semibold">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs sm:text-sm text-white/80 mt-2 line-clamp-2 max-w-2xl font-sans">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subtitle when not hovered */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 md:hidden group-hover:hidden border border-[#747878]/10">
                    <p className="label-caps text-[#a33e00] text-[10px] mb-1">
                      {project.category} • {project.year}
                    </p>
                    <h4 className="font-serif text-lg font-bold text-[#000000]">{project.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {selectedCategory !== 'All' && (
          <div className="w-full flex justify-center mt-16">
            <button
              onClick={() => setSelectedCategory('All')}
              className="border border-[#000000] text-[#000000] px-8 py-4 label-caps hover:bg-[#a33e00] hover:text-white hover:border-[#a33e00] transition-colors duration-300 uppercase tracking-widest cursor-pointer"
            >
              Browse All Projects Archive
            </button>
          </div>
        )}
      </section>

      {/* About / Studio Manifesto Teaser */}
      <section className="bg-[#f3f4f5] py-20 border-t border-b border-[#747878]/15">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#000000] mb-6">
              Studio
            </h2>
            <p className="text-base md:text-lg text-[#444748] mb-8 leading-relaxed">
              Aethelgard Architects is a multidisciplinary design studio focused on creating spaces that resonate with a sense of deliberate calm. We believe in the eloquent reduction of form.
            </p>
            <button
              onClick={() => onNavigate('studio')}
              className="px-8 py-4 bg-[#000000] text-white label-caps hover:bg-[#a33e00] transition-colors uppercase"
            >
              Read Manifesto
            </button>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="aspect-square bg-[#e1e3e4] relative overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida/AP1WRLvfdOA7-iFZuZbXcpSKwdIE3RXM_wJkyGNlPeyLqEJ4Nuyx1NUcUpU3bIkKMXdh46_JzDcpHpAskKclLYO0I3-fytfhWo4iHEDfCWGYb4JUmESGwiiq2hJO2f_DgXdzTy5RIKTK_bsSwdLESnqLfffZCZ_SCEKhqkcS_nXETEMzM5gwhKmvuKEEo_iq0hKKdF72o--rz-tp5FgbpsnEAFwLa8rzFy_lsMH2u3AY4paWIOBUI0aOrg0cqfLq"
                alt="Studio Texture"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeProjectModal}
        onClose={() => setActiveProjectModal(null)}
      />
    </main>
  );
};
