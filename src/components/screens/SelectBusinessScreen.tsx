import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { Store, Warehouse, CheckCircle2, ArrowRight } from 'lucide-react';

export const SelectBusinessScreen: React.FC = () => {
  const { selectBusiness } = useApp();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-between p-6 sm:p-10 select-none">
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
          <p className="text-slate-600 text-sm sm:text-base mt-2">
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
            className="bg-white rounded-2xl p-8 border border-[#F0E6DD] shadow-lg hover:shadow-2xl hover:border-[#FFB1B1] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            onClick={() => selectBusiness('sadat')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#FFFAD3] text-[#2D1515] border border-[#FFDBB0] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                <Store className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D44A4A]">
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
              <div className="space-y-3 my-6 pt-4 border-t border-[#F0E6DD]">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#D44A4A] shrink-0" />
                  <span>Retail Sales (POS &amp; Walk-in Invoices)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#D44A4A] shrink-0" />
                  <span>Service &amp; Workshop (Field Technicians)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#D44A4A] shrink-0" />
                  <span>Customer Support &amp; Warranty Claims</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFB1B1] via-[#FFCCB8] to-[#FFDBB0] hover:brightness-105 text-slate-900 font-extrabold text-sm shadow-md shadow-[#FFB1B1]/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300"
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
            className="bg-white rounded-2xl p-8 border border-[#F0E6DD] shadow-lg hover:shadow-2xl hover:border-[#FFDBB0] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            onClick={() => selectBusiness('ak')}
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#FFDBB0]/40 text-amber-950 border border-[#FFDBB0] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                <Warehouse className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
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
              <div className="space-y-3 my-6 pt-4 border-t border-[#F0E6DD]">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Dealer Supply (Kitchen Appliances)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Dealer Ledger (Khata &amp; Running Balance)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Bulk Sales &amp; Inter-City Recovery</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFDBB0] to-[#FFFAD3] hover:brightness-105 text-slate-900 font-extrabold text-sm shadow-md shadow-[#FFDBB0]/30 border border-[#FFDBB0]/40 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300"
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
        className="w-full text-center py-4 border-t border-[#F0E6DD]"
      >
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Two Businesses &bull; One Platform &bull; Complete Control
        </p>
      </motion.div>
    </div>
  );
};
