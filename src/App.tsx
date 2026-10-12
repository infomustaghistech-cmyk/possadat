/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/screens/LoginScreen';
import { SelectBusinessScreen } from './components/screens/SelectBusinessScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SalesScreen } from './components/screens/SalesScreen';
import { ServiceScreen } from './components/screens/ServiceScreen';
import { WholesaleScreen } from './components/screens/WholesaleScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { FinanceScreen } from './components/screens/FinanceScreen';
import { CustomersDealersScreen } from './components/screens/CustomersDealersScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { WhatsAppScreen } from './components/screens/WhatsAppScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/Toast';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, hasSelectedBusiness, currentTab } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // 1. Auth check
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // 2. Initial business picker check
  if (!hasSelectedBusiness) {
    return <SelectBusinessScreen />;
  }

  // 3. Main Dashboard & Workspace
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex text-slate-800 antialiased font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <TopBar onMenuClick={() => setIsMobileNavOpen(true)} />

        {/* Dynamic Screen View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <DashboardScreen />}
          {currentTab === 'sales' && <SalesScreen />}
          {currentTab === 'service' && <ServiceScreen />}
          {currentTab === 'wholesale' && <WholesaleScreen />}
          {currentTab === 'inventory' && <InventoryScreen />}
          {currentTab === 'finance' && <FinanceScreen />}
          {currentTab === 'customers' && <CustomersDealersScreen />}
          {currentTab === 'reports' && <ReportsScreen />}
          {currentTab === 'whatsapp' && <WhatsAppScreen />}
          {currentTab === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Global System Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
