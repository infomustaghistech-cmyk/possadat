import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { User, Lock, Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const success = login(username, password, rememberMe);
    if (!success) {
      setErrorMessage('Invalid username or password. Use owner / demo123');
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage('Default demo credentials: Username is "owner" and Password is "demo123".');
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0B1F3A]">
      {/* Background Showroom Photo with Deep Navy Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1F3A] via-[#0E2A4F]/95 to-[#081528]/90" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Branding Showcase (Desktop) */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-lg">
          <div className="inline-block">
            <Logo variant="dark" size="lg" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Manage Your Business • Grow Together
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium">
              Enterprise management suite tailored for modern Pakistani retail showrooms and wholesale distribution networks.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 hidden sm:flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#1E6BFF]" />
            <span>Two Businesses • One Platform • Complete Control</span>
          </div>
        </div>

        {/* Right Floating Login Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-7 text-center lg:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center mb-4 mx-auto lg:mx-0 shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to access your business operations dashboard
            </p>
          </div>

          {/* Inline Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (owner)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6BFF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (demo123)"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6BFF] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF] border-slate-300"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#1E6BFF] hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.99]"
            >
              Login to Account
            </button>
          </form>

          {/* Footer Demo Credentials Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Default Login: <span className="font-bold text-slate-800">owner</span> /{' '}
              <span className="font-bold text-slate-800">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
