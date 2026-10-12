import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Lock, Eye, EyeOff, Info } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('sadat');
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
      setErrorMessage('Invalid credentials. Use username: "sadat" & password: "demo123"');
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage('Default demo credentials: Username is "sadat" and Password is "demo123".');
    setErrorMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Showroom Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/showroom_bg.jpg')`,
        }}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/80 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/70 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full min-h-screen px-6 sm:px-12 lg:px-16 py-8 flex flex-col justify-between">
        {/* Center Grid */}
        <div className="my-auto w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Branding Showcase */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Logo Emblem & Brand Title */}
            <div className="flex items-center gap-4 select-none">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full p-1 bg-gradient-to-tr from-[#1E6BFF] via-[#00B4D8] to-[#90E0EF] shadow-2xl shadow-cyan-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0B1F3A] to-[#040D1A] flex items-center justify-center border border-white/20">
                  <svg viewBox="0 0 48 48" className="w-10 h-10 sm:w-12 sm:h-12" fill="none">
                    <defs>
                      <linearGradient id="sgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="50%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#60A5FA" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M33 14C33 10.686 30.314 8 27 8H19C14.582 8 11 11.582 11 16C11 20.418 14.582 24 19 24H29C33.418 24 37 27.582 37 32C37 36.418 33.418 40 29 40H21C17.686 40 15 37.314 15 34"
                      stroke="url(#sgGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="33" cy="14" r="2.5" fill="#38BDF8" />
                    <circle cx="15" cy="34" r="2.5" fill="#60A5FA" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wider leading-none">
                  SADAT GROUP
                </h1>
                <p className="text-base sm:text-lg font-extrabold text-[#38BDF8] tracking-widest uppercase mt-1">
                  CRM &amp; ERP
                </p>
              </div>
            </div>

            {/* Sub-tagline */}
            <p className="text-base sm:text-lg font-medium text-slate-200 tracking-wide">
              Manage Your Business &bull; Grow Together
            </p>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px] bg-white rounded-[28px] p-7 sm:p-9 shadow-2xl border border-slate-100">
              
              {/* Card Header Avatar */}
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1E6BFF] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <User className="w-7 h-7 text-[#1E6BFF]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Sign in to your account
                </p>
              </div>

              {/* Error / Info messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {infoMessage && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#1E6BFF] focus-within:border-transparent transition-all">
                  <User className="w-5 h-5 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-medium text-slate-400 leading-none">
                      Username
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="sadat"
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none pt-0.5 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#1E6BFF] focus-within:border-transparent transition-all">
                  <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-medium text-slate-400 leading-none">
                      Password
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none pt-0.5 placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99]"
                >
                  Login
                </button>

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
              </form>

              {/* Bottom Subtle Tagline */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Local Storage &bull; Secure &bull; Fast
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="w-full max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 font-medium">
          <p>Two Businesses &nbsp;|&nbsp; One Platform &nbsp;|&nbsp; Complete Control</p>
          <p className="text-slate-400">Default Login: <span className="text-slate-200 font-semibold">sadat</span> / <span className="text-slate-200 font-semibold">demo123</span></p>
        </div>
      </div>
    </div>
  );
};
