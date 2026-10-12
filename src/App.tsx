/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  return (
    <AnimatePresence mode="wait">
      {/* 1. Login Stage */}
      {!isAuthenticated ? (
        <motion.div
          key="stage-login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <LoginScreen />
        </motion.div>
      ) : !hasSelectedBusiness ? (
        /* 2. Select Business Stage */
        <motion.div
          key="stage-select-business"
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full min-h-screen"
        >
          <SelectBusinessScreen />
        </motion.div>
      ) : (
        /* 3. Main Dashboard & Workspace */
        <motion.div
          key="stage-workspace"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen bg-[#F4F8FA] flex text-slate-800 antialiased font-sans selection:bg-[#1E5071] selection:text-white overflow-x-hidden w-full max-w-full"
        >
          {/* Sidebar Navigation */}
          <Sidebar
            isMobileOpen={isMobileNavOpen}
            setIsMobileOpen={setIsMobileNavOpen}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300 w-full max-w-full overflow-x-hidden">
            {/* Top Header */}
            <TopBar onMenuClick={() => setIsMobileNavOpen(true)} />

            {/* Dynamic Screen View with Slow & Silky Smooth Page Transitions */}
            <main className="flex-1 p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
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
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {/* Global System Toasts */}
          <ToastContainer />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
