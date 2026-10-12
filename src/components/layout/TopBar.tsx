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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E6ECF3] px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Active Business Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsBizMenuOpen(!isBizMenuOpen);
              setIsMonthMenuOpen(false);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 transition-all text-slate-800 text-xs sm:text-sm font-semibold shadow-2xs"
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                currentBusiness === 'sadat'
                  ? 'bg-[#1E6BFF] text-white'
                  : 'bg-[#16A34A] text-white'
              }`}
            >
              {currentBusiness === 'sadat' ? (
                <Store className="w-3.5 h-3.5" />
              ) : (
                <Building2 className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="truncate max-w-[140px] sm:max-w-none">
              {currentBusiness === 'sadat' ? 'Sadat Electronics' : 'AK Traders'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isBizMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsBizMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Business Unit
                </div>
                <button
                  onClick={() => {
                    setCurrentBusiness('sadat');
                    setIsBizMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sadat Electronics</p>
                      <p className="text-[10px] text-slate-500">Retail & Service Workshop</p>
                    </div>
                  </div>
                  {currentBusiness === 'sadat' && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentBusiness('ak');
                    setIsBizMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">AK Traders</p>
                      <p className="text-[10px] text-slate-500">Wholesale Distribution</p>
                    </div>
                  </div>
                  {currentBusiness === 'ak' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Month Filter, Notifications Bell, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Month Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMonthMenuOpen(!isMonthMenuOpen);
              setIsBizMenuOpen(false);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#1E6BFF]" />
            <span>{selectedMonthLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMonthMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMonthMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                      selectedMonth === m.key
                        ? 'text-[#1E6BFF] bg-blue-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{m.label}</span>
                    {selectedMonth === m.key && (
                      <Check className="w-3.5 h-3.5 text-[#1E6BFF]" />
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
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
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
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Sadat
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                Administrator
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E6BFF] to-[#60A5FA] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
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
