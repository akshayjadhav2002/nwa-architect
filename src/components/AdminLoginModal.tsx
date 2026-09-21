import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: { name?: string; email: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const user = userCredential.user;
      
      // Sync user with PostgreSQL backend
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      }).catch((err) => console.error('Error syncing user:', err));

      setIsGoogleLoading(false);
      onLoginSuccess({
        name: user.displayName || user.email?.split('@')[0] || 'Studio Admin',
        email: user.email || 'admin@nwa.com',
      });
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setIsGoogleLoading(false);
      setError(err.message || 'Google authentication failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Please enter your studio email or username.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter your access password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsLoading(false);
        setError(data.error || 'Invalid credentials. Access is denied.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login request error:', err);
      setIsLoading(false);
      setError('Connection to authentication service failed. Please try again.');
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@nwa.com');
    setPassword('studio2024');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#000000]/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] sm:max-h-[88vh] bg-[#ffffff] border border-[#747878]/20 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 my-auto rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Architectural Accent Line */}
        <div className="h-1 bg-[#a33e00] w-full shrink-0" />

        {/* Header Section */}
        <div className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-[#747878]/15 bg-[#f8f9fa] flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#a33e00] text-xl">admin_panel_settings</span>
              <span className="label-caps text-[#a33e00] tracking-widest text-[11px]">
                Internal Access Only
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#000000] tracking-tight">
              Studio Portal Sign In
            </h2>
            <p className="text-xs text-[#444748] mt-1 font-sans">
              Enter credentials or authenticate with Google to manage NWA projects.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#444748] hover:text-[#000000] p-1 rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Close login dialog"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Form Body - Scrollable if screen height is small */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[#ba1a1a]/10 border-l-2 border-[#ba1a1a] text-[#ba1a1a] text-xs flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full bg-white border border-[#747878]/30 hover:border-[#000000] text-[#191c1d] py-3 px-4 flex items-center justify-center gap-3 transition-colors shadow-xs text-xs font-semibold label-caps tracking-wider uppercase"
          >
            {isGoogleLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#191c1d] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google Account</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-[#747878]/20 flex-1" />
            <span className="text-[10px] label-caps text-[#747878] uppercase tracking-widest">Or Studio Credentials</span>
            <div className="h-px bg-[#747878]/20 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Demo Hint */}
            <div className="bg-[#f3f4f5] p-2.5 border border-[#747878]/15 flex items-center justify-between text-xs text-[#444748]">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-sm text-[#a33e00]">info</span>
                <span className="truncate">Default: <strong className="text-[#000000]">admin@nwa.com</strong></span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] label-caps text-[#a33e00] hover:underline shrink-0 ml-2 font-semibold uppercase"
              >
                Auto-fill
              </button>
            </div>

            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block label-caps text-[11px] text-[#444748]">
                Studio Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#747878]">
                  person
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nwa.com"
                  required
                  className="w-full bg-[#f8f9fa] border border-[#747878]/25 pl-10 pr-4 py-2.5 text-sm text-[#191c1d] focus:outline-none focus:border-[#000000] focus:bg-white transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block label-caps text-[11px] text-[#444748]">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#747878]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#f8f9fa] border border-[#747878]/25 pl-10 pr-10 py-2.5 text-sm text-[#191c1d] focus:outline-none focus:border-[#000000] focus:bg-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#000000] focus:outline-none"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between text-xs text-[#444748] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#a33e00] w-4 h-4 rounded-none cursor-pointer"
                />
                <span>Keep session active</span>
              </label>
              <span className="text-[11px] text-[#747878]">Cloud SQL Synced</span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#000000] text-white label-caps py-3 px-6 hover:bg-[#a33e00] transition-colors duration-300 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 text-xs font-semibold"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Studio Admin</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-transparent text-[#444748] hover:text-[#000000] label-caps py-1.5 text-center text-xs uppercase tracking-wider transition-colors"
              >
                Return to Website
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-8 py-3 bg-[#f3f4f5] border-t border-[#747878]/15 text-center text-[10px] text-[#747878] label-caps">
          NWA Architects • Executive Admin Portal (PostgreSQL Backend)
        </div>
      </div>
    </div>
  );
};
