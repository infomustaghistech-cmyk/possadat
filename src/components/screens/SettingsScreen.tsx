import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessId } from '../../types';
import { Store, Building2, User, Percent, Save, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { businessConfigs, updateBusinessConfig, addToast } = useApp();

  const [sadatName, setSadatName] = useState(businessConfigs.sadat?.name || 'SADAT ELECTRONICS');
  const [sadatPhone, setSadatPhone] = useState(businessConfigs.sadat?.phone || '+92 21 34981122');
  const [sadatWhatsapp, setSadatWhatsapp] = useState(businessConfigs.sadat?.whatsapp || '03002345678');
  const [sadatAddress, setSadatAddress] = useState(
    businessConfigs.sadat?.address ||
      'Shop 8-10, Main Rashid Minhas Road, Gulshan-e-Iqbal Block 10-A, Karachi'
  );
  const [sadatNtn, setSadatNtn] = useState(businessConfigs.sadat?.ntn || '7412890-3');

  const [akName, setAkName] = useState(businessConfigs.ak?.name || 'AK TRADERS');
  const [akPhone, setAkPhone] = useState(businessConfigs.ak?.phone || '+92 21 32415588');
  const [akWhatsapp, setAkWhatsapp] = useState(businessConfigs.ak?.whatsapp || '03212345678');
  const [akAddress, setAkAddress] = useState(
    businessConfigs.ak?.address ||
      'Godown 12, Plot 45-B, Sector 7-A, Korangi Industrial Area, Karachi'
  );
  const [akNtn, setAkNtn] = useState(businessConfigs.ak?.ntn || '8523914-1');

  const [defaultTechCommission, setDefaultTechCommission] = useState(30);

  const handleSaveSadat = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig('sadat', {
      name: sadatName,
      phone: sadatPhone,
      whatsapp: sadatWhatsapp,
      address: sadatAddress,
      ntn: sadatNtn,
    });
  };

  const handleSaveAk = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig('ak', {
      name: akName,
      phone: akPhone,
      whatsapp: akWhatsapp,
      address: akAddress,
      ntn: akNtn,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-[#E6ECF3]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System & Enterprise Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure business legal profiles, invoice headers, default commissions and regional parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Sadat Electronics Profile */}
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sadat Electronics Profile</h3>
              <p className="text-[11px] text-slate-500">Retail Showroom & Service Workshop</p>
            </div>
          </div>

          <form onSubmit={handleSaveSadat} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
              <input
                type="text"
                value={sadatName}
                onChange={(e) => setSadatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Landline Phone</label>
                <input
                  type="text"
                  value={sadatPhone}
                  onChange={(e) => setSadatPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp Hotline</label>
                <input
                  type="text"
                  value={sadatWhatsapp}
                  onChange={(e) => setSadatWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Showroom Address</label>
              <input
                type="text"
                value={sadatAddress}
                onChange={(e) => setSadatAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Federal FBR NTN #</label>
              <input
                type="text"
                value={sadatNtn}
                onChange={(e) => setSadatNtn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#1E6BFF] text-white font-bold text-xs shadow-xs hover:bg-blue-600 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Sadat Electronics Info</span>
            </button>
          </form>
        </div>

        {/* Card 2: AK Traders Profile */}
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AK Traders Profile</h3>
              <p className="text-[11px] text-slate-500">Wholesale Distribution Unit</p>
            </div>
          </div>

          <form onSubmit={handleSaveAk} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Trade Title</label>
              <input
                type="text"
                value={akName}
                onChange={(e) => setAkName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Wholesale Office</label>
                <input
                  type="text"
                  value={akPhone}
                  onChange={(e) => setAkPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp Recovery</label>
                <input
                  type="text"
                  value={akWhatsapp}
                  onChange={(e) => setAkWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Warehouse / Godown Address</label>
              <input
                type="text"
                value={akAddress}
                onChange={(e) => setAkAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">FBR Wholesale NTN #</label>
              <input
                type="text"
                value={akNtn}
                onChange={(e) => setAkNtn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#16A34A] text-white font-bold text-xs shadow-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update AK Traders Info</span>
            </button>
          </form>
        </div>
      </div>

      {/* Row 2: User Profile & Regional Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Details */}
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-[#1E6BFF]" />
            <h3 className="text-sm font-bold text-slate-900">Administrator Credentials</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Active Login Role:</span>
              <span className="font-bold text-slate-900">Executive Owner (Full Access)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Default Username:</span>
              <span className="font-bold text-slate-900 font-mono">owner</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Security Access PIN:</span>
              <span className="font-bold text-slate-900 font-mono">demo123</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Data Persistence:</span>
              <span className="font-bold text-emerald-600">Local Browser Store (Encrypted)</span>
            </div>
          </div>
        </div>

        {/* Regional & Financial Formatting */}
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-[#1E6BFF]" />
            <h3 className="text-sm font-bold text-slate-900">Regional Currency & Formats</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Official Currency:</span>
              <span className="font-bold text-slate-900">Pakistani Rupee (PKR - Rs.)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Numbering Notation:</span>
              <span className="font-bold text-slate-900">Lakh / Crore & en-PK (e.g. Rs. 1,25,000)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Time Zone:</span>
              <span className="font-bold text-slate-900">Asia/Karachi (PKT UTC+5)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Current Reference Date:</span>
              <span className="font-bold text-[#1E6BFF]">12 October 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
