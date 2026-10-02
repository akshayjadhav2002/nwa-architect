import React, { useState } from 'react';

interface ContactViewProps {
  onSubmitInquiry: (inquiry: {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    message: string;
  }) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onSubmitInquiry }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Field validation and touched states
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Full name is required';
        if (trimmed.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name contains invalid characters';
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
        return '';
      }
      case 'phone': {
        const trimmed = value.trim();
        if (!trimmed) return 'Mobile number is required';
        // Check for valid phone: allows +, spaces, parentheses, dashes, and requires 7-15 digits
        const digitsOnly = trimmed.replace(/\D/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) {
          return 'Please enter a valid phone number (7–15 digits)';
        }
        if (!/^[+]?[0-9\s\-()]{7,20}$/.test(trimmed)) {
          return 'Invalid phone number format';
        }
        return '';
      }
      case 'projectType': {
        if (!value) return 'Please select a project category';
        return '';
      }
      case 'message': {
        const trimmed = value.trim();
        if (!trimmed) return 'Project message is required';
        if (trimmed.length < 10) return 'Please provide at least 10 characters for your brief';
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'phone') setPhone(value);
    if (field === 'projectType') setProjectType(value);
    if (field === 'message') setMessage(value);

    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const phoneErr = validateField('phone', phone);
    const projectTypeErr = validateField('projectType', projectType);
    const messageErr = validateField('message', message);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      projectType: projectTypeErr,
      message: messageErr,
    };

    setTouched({
      name: true,
      email: true,
      phone: true,
      projectType: true,
      message: true,
    });

    setErrors(newErrors);

    if (nameErr || emailErr || phoneErr || projectTypeErr || messageErr) {
      return;
    }

    onSubmitInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      projectType,
      message: message.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setProjectType('');
      setMessage('');
      setTouched({});
      setErrors({});
      setSubmitted(false);
    }, 4000);
  };

  return (
    <main className="max-w-[1440px] mx-auto w-full px-6 md:px-20 py-12 md:py-20 flex flex-col gap-16">
      {/* Header Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8 space-y-6">
          <h1 className="font-serif text-4xl md:text-7xl font-bold text-[#000000]">
            Contact
          </h1>
          <p className="text-base md:text-lg text-[#444748] max-w-2xl leading-relaxed">
            For project inquiries, press opportunities, or career information, please reach out to the appropriate office or department. We look forward to beginning a dialogue.
          </p>
        </div>

        <div className="md:col-span-4 hidden md:block">
          <div className="w-full aspect-square bg-cover bg-center filter grayscale hover:grayscale-0 transition-all duration-700 border border-[#747878]/20"
               style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0j-ns8el8IjiA9gYurHyvKnCMwj3SGTwJKeZo415KiYgi3NW86_FnkNTb0P_4VExGuOLrQkw-gfel26j0szskbcdw8-VTJ-5xhkxaiiGy3afFcF7C1GePJi7QeGtbtIRTJ38AWibdzgIhn8c2r8ogw9WIBKdkvnXvYt8zN2u3R2JZe-ecqeXi9dLQAY2yS9cgNQuhx6xzBij4Kzs5OHUMxyJddTPjza5jwXxN6cFrGMR6Sq4V7T5XHg")' }}>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-[#747878]/15"></div>

      {/* Details & Form Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Locations & Direct Contact */}
        <div className="md:col-span-5 space-y-12">
          {/* Pune HQ */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#000000] mb-6 border-b border-[#747878]/20 pb-4">
              Studio Locations
            </h2>
            <div className="space-y-2">
              <h3 className="label-caps text-[#a33e00] uppercase">Pune HQ</h3>
              <a
                href="https://maps.google.com/?q=18.515333,73.830528"
                target="_blank"
                rel="noopener noreferrer"
                className="group block text-base text-[#191c1d] hover:text-[#a33e00] transition-colors leading-relaxed"
                title="Open 18°30'55.2&quot;N 73°49'49.9&quot;E on Google Maps"
              >
                <span className="inline-flex items-start gap-1.5">
                  <span>
                    Nilesh Waman &amp; Associates<br />
                    Flat no. 3, 76-Shrushti Prabhat,<br />
                    Kashinath Shastri Abhyankar path, lane no.-15,<br />
                    near symbiosis School, Prabhat road,<br />
                    pune-411004
                  </span>
                  <span className="material-symbols-outlined text-base text-[#747878] group-hover:text-[#a33e00] transition-colors pt-0.5 shrink-0">
                    open_in_new
                  </span>
                </span>
              </a>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-[#747878] font-mono">
                <span className="material-symbols-outlined text-sm text-[#a33e00]">location_on</span>
                <span>18°30'55.2"N 73°49'49.9"E</span>
              </div>
              <p className="text-base text-[#444748] pt-2 font-mono">
                +91 9850601673, +91 8830910827
              </p>
            </div>
          </div>

          {/* Direct Inquiries */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#000000] mb-6 border-b border-[#747878]/20 pb-4">
              Direct Inquiries
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer border-b border-[#747878]/15 pb-4 hover:border-[#a33e00] transition-colors">
                <div>
                  <p className="label-caps text-[#444748] mb-1 uppercase">General</p>
                  <a href="mailto:nwa.architects2002@gmail.com" className="text-base font-semibold text-[#000000] group-hover:text-[#a33e00] transition-colors">
                    nwa.architects2002@gmail.com
                  </a>
                </div>
                <span className="material-symbols-outlined text-[#747878] group-hover:text-[#a33e00] transition-colors">
                  arrow_forward
                </span>
              </div>

              <div className="flex items-center justify-between group cursor-pointer border-b border-[#747878]/15 pb-4 hover:border-[#a33e00] transition-colors">
                <div>
                  <p className="label-caps text-[#444748] mb-1 uppercase">Press</p>
                  <a href="mailto:nwa.architects2002@gmail.com" className="text-base font-semibold text-[#000000] group-hover:text-[#a33e00] transition-colors">
                    nwa.architects2002@gmail.com
                  </a>
                </div>
                <span className="material-symbols-outlined text-[#747878] group-hover:text-[#a33e00] transition-colors">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block md:col-span-1"></div>

        {/* General Inquiries Form */}
        <div className="md:col-span-6 bg-white p-8 border border-[#747878]/15 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#000000] mb-8 border-b border-[#747878]/20 pb-4">
            General Inquiries
          </h2>

          {submitted ? (
            <div className="py-16 text-center space-y-4 animate-fade-in">
              <span className="material-symbols-outlined text-6xl text-[#a33e00]">check_circle</span>
              <h3 className="font-serif text-2xl font-bold text-[#000000]">Inquiry Received</h3>
              <p className="text-[#444748]">Thank you, {name}. We will review your project brief and respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              {/* Full Name */}
              <div className="relative">
                <label className="label-caps text-[#444748] uppercase block mb-2 flex items-center justify-between" htmlFor="fullName">
                  <span>Full Name</span>
                  <span className="text-[10px] text-[#747878] normal-case tracking-normal">Required</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={(e) => handleBlur('name', e.target.value)}
                  className={`w-full bg-transparent border-0 border-b text-base text-[#000000] focus:ring-0 pb-2 px-0 transition-colors ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#747878]/30 focus:border-[#000000]'
                  }`}
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="relative">
                <label className="label-caps text-[#444748] uppercase block mb-2 flex items-center justify-between" htmlFor="emailAddress">
                  <span>Email Address</span>
                  <span className="text-[10px] text-[#747878] normal-case tracking-normal">Required</span>
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  className={`w-full bg-transparent border-0 border-b text-base text-[#000000] focus:ring-0 pb-2 px-0 transition-colors ${
                    touched.email && errors.email
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#747878]/30 focus:border-[#000000]'
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="relative">
                <label className="label-caps text-[#444748] uppercase block mb-2 flex items-center justify-between" htmlFor="mobileNumber">
                  <span>Mobile Number</span>
                  <span className="text-[10px] text-[#747878] normal-case tracking-normal">Required</span>
                </label>
                <input
                  id="mobileNumber"
                  type="tel"
                  placeholder="+91 98506 01673"
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  className={`w-full bg-transparent border-0 border-b text-base text-[#000000] focus:ring-0 pb-2 px-0 font-mono transition-colors ${
                    touched.phone && errors.phone
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#747878]/30 focus:border-[#000000]'
                  }`}
                />
                {touched.phone && errors.phone ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{errors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#747878] mt-1 font-mono">
                    Include country code (e.g. +91 98506 01673 or +1 555-0199)
                  </p>
                )}
              </div>

              {/* Project Type */}
              <div className="relative">
                <label className="label-caps text-[#444748] uppercase block mb-2 flex items-center justify-between" htmlFor="projectType">
                  <span>Project Category</span>
                  <span className="text-[10px] text-[#747878] normal-case tracking-normal">Required</span>
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => handleChange('projectType', e.target.value)}
                  onBlur={(e) => handleBlur('projectType', e.target.value)}
                  className={`w-full bg-transparent border-0 border-b text-base text-[#000000] focus:ring-0 pb-2 px-0 cursor-pointer transition-colors ${
                    touched.projectType && errors.projectType
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#747878]/30 focus:border-[#000000]'
                  }`}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="cultural">Cultural / Civic</option>
                  <option value="hospitality">Hospitality &amp; Leisure</option>
                  <option value="landscape">Landscape &amp; Urban Design</option>
                  <option value="interior">Interior Architecture</option>
                  <option value="other">Other Consultation</option>
                </select>
                {touched.projectType && errors.projectType && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{errors.projectType}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="label-caps text-[#444748] uppercase block" htmlFor="message">
                    Project Message &amp; Brief
                  </label>
                  <span className="text-[10px] text-[#747878]">
                    {message.trim().length} chars (min 10)
                  </span>
                </div>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Brief description of your plot, scope, timeline, and architectural requirements..."
                  value={message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={(e) => handleBlur('message', e.target.value)}
                  className={`w-full bg-transparent border-0 border-b text-base text-[#000000] focus:ring-0 pb-2 px-0 resize-none transition-colors ${
                    touched.message && errors.message
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#747878]/30 focus:border-[#000000]'
                  }`}
                />
                {touched.message && errors.message && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 bg-[#000000] text-white label-caps py-4 px-8 w-fit hover:bg-[#a33e00] transition-colors duration-300 uppercase tracking-widest flex items-center gap-2 group cursor-pointer"
              >
                <span>Submit Inquiry</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                  arrow_right_alt
                </span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Embedded Location Map */}
      <section className="w-full space-y-6 pt-4 border-t border-[#747878]/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="label-caps text-[#a33e00] font-bold uppercase tracking-widest block mb-1">
              Location Map
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#000000]">
              Find Our Pune Office
            </h2>
          </div>
          <a
            href="https://maps.google.com/?q=18.515333,73.830528"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#000000] text-white hover:bg-[#a33e00] label-caps px-5 py-3 text-xs uppercase tracking-wider transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-sm">directions</span>
            <span>Get Directions in Google Maps</span>
          </a>
        </div>

        <div className="w-full h-80 md:h-96 border border-[#747878]/20 bg-[#f3f4f5] overflow-hidden relative shadow-sm">
          <iframe
            title="NWA Architects Pune Office Location"
            src="https://maps.google.com/maps?q=18.515333,73.830528&hl=en&z=17&output=embed"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </main>
  );
};
