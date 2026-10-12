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
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#0B1F3A] to-[#0E2A4F] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl border-r border-[#1B355A]`}
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
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              currentBusiness === 'sadat'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {currentBusiness === 'sadat' ? (
              <Store className="w-4 h-4" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] tracking-wider uppercase text-white/50 font-semibold block">
              Active Unit
            </span>
            <p className="text-xs font-bold text-white truncate">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1E6BFF] text-white shadow-md shadow-blue-500/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/90'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/70'
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
