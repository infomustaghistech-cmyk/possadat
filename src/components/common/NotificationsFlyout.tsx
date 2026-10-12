import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, Wrench, ShieldAlert, X, ChevronRight } from 'lucide-react';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, setCurrentTab } = useApp();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#F0E6DD] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center justify-between px-4 py-3 bg-[#FFFDF9] border-b border-[#F0E6DD]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#D44A4A]" />
            <h4 className="text-sm font-bold text-slate-900">System Notifications</h4>
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFB1B1] text-slate-900 border border-[#2D1515]/20">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              All systems smooth! No pending warnings or alerts.
            </div>
          ) : (
            notifications.map((alert) => {
              const isRed = alert.severity === 'red';
              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    setCurrentTab(alert.linkTab);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-[#FFFDF9] transition-colors cursor-pointer group flex items-start gap-3"
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isRed ? 'bg-red-100 text-red-600' : 'bg-[#FFFAD3] text-amber-900 border border-[#FFDBB0]'
                    }`}
                  >
                    {alert.type === 'low_stock' && <AlertTriangle className="w-4 h-4" />}
                    {alert.type === 'complaint' && <Wrench className="w-4 h-4" />}
                    {alert.type === 'dealer_overdue' && <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#D44A4A] transition-colors truncate">
                        {alert.title}
                      </h5>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D44A4A] transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            Sadat Group ERP Real-Time System Monitor
          </span>
        </div>
      </div>
    </>
  );
};
