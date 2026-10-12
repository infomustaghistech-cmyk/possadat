import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
}) => {
  const isLight = variant === 'light'; // Light background vs dark sidebar

  const dimensions = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic S Crest Logo */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-tr from-[#143B55] via-[#1E5071] to-[#2C6D98] shadow-md shadow-[#1E5071]/30 text-white"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28 13.5C28 10.4624 25.5376 8 22.5 8H14C12.3431 8 11 9.34315 11 11C11 12.6569 12.3431 14 14 14H22.5C23.8807 14 25 15.1193 25 16.5C25 17.8807 23.8807 19 22.5 19H17C13.6863 19 11 21.6863 11 25C11 28.3137 13.6863 31 17 31H26C27.6569 31 29 29.6569 29 28C29 26.3431 27.6569 25 26 25H17C15.6193 25 14.5 23.8807 14.5 22.5C14.5 21.1193 15.6193 20 17 20H22.5C25.5376 20 28 17.5376 28 14.5V13.5Z"
            fill="white"
          />
          <circle cx="28" cy="10" r="2.5" fill="#A8D0EB" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`font-extrabold tracking-wide font-sans ${dimensions.text} ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          SADAT GROUP
        </span>
        <span
          className={`font-semibold tracking-wider uppercase font-mono ${dimensions.sub} ${
            isLight ? 'text-[#1E5071]' : 'text-[#8EC5EA]'
          }`}
        >
          CRM & ERP
        </span>
      </div>
    </div>
  );
};
