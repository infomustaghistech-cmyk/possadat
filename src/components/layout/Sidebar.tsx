import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { ResetDataModal } from '../common/ResetDataModal';
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Truck,
  Boxes,
  TrendingUp,
  Users,
  FileBarChart,
  MessageSquare,
  Settings,
  RotateCcw,
  X,
  Store,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentBusiness, currentTab, setCurrentTab, resetToInitialData } = useApp();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Menu items list
  // When AK Traders is selected, hide Service & Workshop and position Wholesale prominently
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      showAlways: true,
    },
    {
      id: 'wholesale',
      label: 'Wholesale (AK)',
      icon: Truck,
      showAlways: true,
      badge: currentBusiness === 'ak' ? 'Active' : undefined,
    },
    {
      id: 'sales',
      label: 'Sales (POS)',
      icon: ShoppingCart,
      showAlways: true,
      badge: currentBusiness === 'sadat' ? 'Retail' : undefined,
    },
    {
      id: 'service',
      label: 'Service & Workshop',
      icon: Wrench,
      showAlways: false,
      hideOnAK: true,
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Boxes,
      showAlways: true,
    },
    {
      id: 'finance',
      label: 'Finance & P&L',
      icon: TrendingUp,
      showAlways: true,
    },
    {
      id: 'customers',
      label: 'Customers & Dealers',
      icon: Users,
      showAlways: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      showAlways: true,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      showAlways: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      showAlways: true,
    },
  ];

  // Filter items based on active business
  const visibleItems = menuItems.filter((item) => {
    if (currentBusiness === 'ak' && item.hideOnAK) return false;
    return true;
  });

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#0E273C] via-[#13334F] to-[#1A4264] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl border-r border-[#1B4365]/60`}
      >
        {/* Top Logo & Close Button */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <Logo variant="dark" size="md" />
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Business Indicator Mini Banner */}
        <div className="px-3.5 py-2.5 mx-3 my-2 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-3 backdrop-blur-md shadow-inner">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              currentBusiness === 'sadat'
                ? 'bg-gradient-to-tr from-[#1E5071] to-[#3683B8] text-white'
                : 'bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white'
            }`}
          >
            {currentBusiness === 'sadat' ? (
              <Store className="w-4 h-4 font-bold" />
            ) : (
              <Building2 className="w-4 h-4 font-bold" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] tracking-widest uppercase text-[#8EC5EA] font-bold block leading-tight">
              Active Unit
            </span>
            <p className="text-xs font-semibold text-white truncate tracking-tight mt-0.5">
              {currentBusiness === 'sadat' ? 'Sadat Electronics' : 'AK Traders Wholesale'}
            </p>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-300 ease-out ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2E73A1] text-white shadow-lg shadow-[#0E273C]/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08] font-normal hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#8EC5EA]'
                    }`}
                  />
                  <span className="truncate tracking-[-0.01em]">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#8EC5EA]/15 text-[#A8D4F2] border border-[#8EC5EA]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Area: Reset Demo Data */}
        <div className="p-3 border-t border-white/10 bg-black/10">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 font-semibold text-xs transition-colors border border-rose-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Reset Confirmation Modal */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToInitialData}
      />
    </>
  );
};
