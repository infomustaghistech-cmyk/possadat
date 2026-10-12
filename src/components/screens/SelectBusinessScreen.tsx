import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { Store, Warehouse, CheckCircle2, ArrowRight } from 'lucide-react';

export const SelectBusinessScreen: React.FC = () => {
  const { selectBusiness } = useApp();

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-between p-6 sm:p-10 select-none">
      {/* Top Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl flex items-center justify-center pt-4"
      >
        <Logo variant="light" size="lg" />
      </motion.div>

      {/* Main Choice Section */}
      <div className="w-full max-w-4xl my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Business
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Choose the business division you want to operate today. You can switch between them anytime.
          </p>
        </motion.div>

        {/* Two Large Cards Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Sadat Electronics */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.35, ease: [0.25, 1, 0.35, 1] } }}
            className="bg-white rounded-2xl p-8 border border-[#E6ECF3] shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            onClick={() => selectBusiness('sadat')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                <Store className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E6BFF]">
                  Retail Showroom
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  SADAT ELECTRONICS
                </h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Retail &amp; Service Workshop
                </p>
              </div>

              {/* Ticks List */}
              <div className="space-y-3 my-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#1E6BFF] shrink-0" />
                  <span>Retail Sales (POS &amp; Walk-in Invoices)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#1E6BFF] shrink-0" />
                  <span>Service &amp; Workshop (Field Technicians)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#1E6BFF] shrink-0" />
                  <span>Customer Support &amp; Warranty Claims</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#1E6BFF] group-hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300"
            >
              <span>Select Business</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 2: AK Traders */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, transition: { duration: 0.35, ease: [0.25, 1, 0.35, 1] } }}
            className="bg-white rounded-2xl p-8 border border-[#E6ECF3] shadow-lg hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            onClick={() => selectBusiness('ak')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                <Warehouse className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  Wholesale Hub
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  AK TRADERS
                </h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Wholesale Distribution
                </p>
              </div>

              {/* Ticks List */}
              <div className="space-y-3 my-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <span>Dealer Supply (Kitchen Appliances)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <span>Dealer Ledger (Khata &amp; Running Balance)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <span>Bulk Sales &amp; Inter-City Recovery</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#16A34A] group-hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300"
            >
              <span>Select Business</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Footer Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full text-center py-4 border-t border-slate-200/60"
      >
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Two Businesses &bull; One Platform &bull; Complete Control
        </p>
      </motion.div>
    </div>
  );
};
