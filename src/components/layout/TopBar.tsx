import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MONTH_OPTIONS } from '../../utils/formatters';
import { NotificationsFlyout } from '../common/NotificationsFlyout';
import {
  Menu,
  ChevronDown,
  Calendar,
  Bell,
  Store,
  Building2,
  LogOut,
  User,
  Check,
} from 'lucide-react';
import { MonthKey, BusinessId } from '../../types';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const {
    currentBusiness,
    setCurrentBusiness,
    selectedMonth,
    setSelectedMonth,
    notifications,
    logout,
  } = useApp();

  const [isBizMenuOpen, setIsBizMenuOpen] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const selectedMonthLabel =
    MONTH_OPTIONS.find((m) => m.key === selectedMonth)?.label || selectedMonth;

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F0E6DD] px-2.5 sm:px-4 md:px-6 flex items-center justify-between shadow-xs w-full max-w-full">
      {/* Left: Mobile hamburger & Active Business Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Switcher Dropdown */}
        <div className="relative min-w-0">
          <button
            onClick={() => {
              setIsBizMenuOpen(!isBizMenuOpen);
              setIsMonthMenuOpen(false);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl border border-[#F0E6DD] hover:border-[#FFCCB8] bg-white hover:bg-[#FFFDF9] transition-all text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs min-w-0"
          >
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                currentBusiness === 'sadat'
                  ? 'bg-gradient-to-tr from-[#FFB1B1] to-[#FFCCB8] text-[#2D1515]'
                  : 'bg-gradient-to-tr from-[#FFDBB0] to-[#FFFAD3] text-[#2D1515]'
              }`}
            >
              {currentBusiness === 'sadat' ? (
                <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </div>
            <span className="truncate max-w-[80px] xs:max-w-[125px] sm:max-w-none">
              {currentBusiness === 'sadat' ? 'Sadat' : 'AK Traders'}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          </button>

          {isBizMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsBizMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#F0E6DD] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Business Unit
                </div>
                <button
                  onClick={() => {
                    setCurrentBusiness('sadat');
                    setIsBizMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-[#FFFDF9] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FFB1B1]/20 text-[#D44A4A] flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sadat Electronics</p>
                      <p className="text-[10px] text-slate-500">Retail & Service Workshop</p>
                    </div>
                  </div>
                  {currentBusiness === 'sadat' && (
                    <Check className="w-4 h-4 text-[#D44A4A]" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentBusiness('ak');
                    setIsBizMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-[#FFFDF9] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FFDBB0]/30 text-amber-800 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">AK Traders</p>
                      <p className="text-[10px] text-slate-500">Wholesale Distribution</p>
                    </div>
                  </div>
                  {currentBusiness === 'ak' && (
                    <Check className="w-4 h-4 text-amber-700" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Month Filter, Notifications Bell, User Avatar */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Subtle Palette Swatch Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#FFFAD3]/40 border border-[#FFDBB0]/60 shadow-2xs" title="Sadat Warm Palette">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFFAD3] border border-amber-300/80 shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFDBB0] border border-amber-400/80 shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFCCB8] border border-rose-300/80 shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB1B1] border border-rose-400/80 shadow-2xs" />
        </div>

        {/* Month Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMonthMenuOpen(!isMonthMenuOpen);
              setIsBizMenuOpen(false);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#F0E6DD] bg-white hover:bg-[#FFFDF9] text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D44A4A] shrink-0" />
            <span className="hidden sm:inline">{selectedMonthLabel}</span>
            <span className="sm:hidden text-[11px] font-bold">
              {MONTH_OPTIONS.find((m) => m.key === selectedMonth)?.label.split(' ')[0] || selectedMonth}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
          </button>

          {isMonthMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMonthMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#F0E6DD] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Reporting Period
                </div>
                {MONTH_OPTIONS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setSelectedMonth(m.key as MonthKey);
                      setIsMonthMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-[#FFFDF9] transition-colors ${
                      selectedMonth === m.key
                        ? 'text-[#D44A4A] bg-[#FFFAD3]/50 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{m.label}</span>
                    {selectedMonth === m.key && (
                      <Check className="w-3.5 h-3.5 text-[#D44A4A]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsBizMenuOpen(false);
              setIsMonthMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#FFFDF9] transition-colors shrink-0"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#FFB1B1] text-[#2D1515] text-[9px] sm:text-[10px] font-black flex items-center justify-center animate-pulse border border-[#2D1515]/20">
                {notifications.length}
              </span>
            )}
          </button>

          <NotificationsFlyout
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsBizMenuOpen(false);
              setIsMonthMenuOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 sm:pl-2 rounded-xl border border-[#F0E6DD] hover:bg-[#FFFDF9] transition-colors shrink-0"
          >
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Sadat
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Administrator
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#FFB1B1] via-[#FFCCB8] to-[#FFDBB0] text-[#2D1515] flex items-center justify-center font-extrabold text-[11px] sm:text-xs shadow-2xs shrink-0">
              SD
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Sadat (Owner)</p>
                  <p className="text-[11px] text-slate-500">sadat@sadatgroup.pk</p>
                </div>
                <div className="px-3.5 py-2 border-b border-slate-100 text-[11px] text-slate-500">
                  Current Session: <span className="font-semibold text-slate-700 capitalize">{currentBusiness} Unit</span>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
