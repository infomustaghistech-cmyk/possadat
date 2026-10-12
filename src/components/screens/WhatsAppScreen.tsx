import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppMessage } from '../../types';
import { openWhatsAppLink, formatDateTime } from '../../utils/formatters';
import {
  MessageSquare,
  Share2,
  Clock,
  CheckCircle2,
  Settings,
  Info,
  Send,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';

export const WhatsAppScreen: React.FC = () => {
  const {
    whatsappHistory,
    sendWhatsAppMessage,
    currentBusiness,
    customers,
    dealers,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');

  // Automation Toggles
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [autoComplaint, setAutoComplaint] = useState(true);
  const [autoTechAssign, setAutoTechAssign] = useState(true);
  const [autoWeeklyDealer, setAutoWeeklyDealer] = useState(true);
  const [autoLowStock, setAutoLowStock] = useState(false);

  // Template Form State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<
    'service_invoice' | 'complaint_status' | 'payment_reminder' | 'welcome' | 'offer'
  >('service_invoice');

  const [recipientName, setRecipientName] = useState(customers[0]?.name || 'Dr. Asif Siddiqui');
  const [recipientPhone, setRecipientPhone] = useState(customers[0]?.phone || '03219876543');
  const [customNo, setCustomNo] = useState('SV-0105');
  const [customAmount, setCustomAmount] = useState('Rs. 3,700');
  const [customTech, setCustomTech] = useState('Ali Raza');

  // Templates definition with raw text containing placeholders
  const templates = {
    service_invoice: {
      type: 'Service Invoice' as const,
      label: 'Service Invoice Receipt',
      rawText:
        'Dear {name}, your service invoice {no} from {business} has been generated for {amount}. Assigned technician: {tech}. Thank you for choosing us!',
    },
    complaint_status: {
      type: 'Complaint Status' as const,
      label: 'Complaint Status Update',
      rawText:
        'Dear {name}, ticket {no} regarding your appliance is currently In Progress. Field technician {tech} from {business} is attending to your inspection. Hotline: +92 21 34981122.',
    },
    payment_reminder: {
      type: 'Payment Reminder' as const,
      label: 'Khata Payment Reminder',
      rawText:
        'Respected {name}, greetings from {business}. A pending balance of {amount} is outstanding on bill/dispatch {no}. Kindly process payment at your earliest convenience.',
    },
    welcome: {
      type: 'Welcome Message' as const,
      label: 'Customer Welcome Note',
      rawText:
        'Welcome to {business}, {name}! Thank you for registering your profile. We provide genuine home appliances with official warranty and expert field repairs in Karachi.',
    },
    offer: {
      type: 'Offer / Promotion' as const,
      label: 'Seasonal Offer / Promotion',
      rawText:
        'Special Announcement from {business}! Enjoy seasonal discounts up to 15% on premium Inverter ACs and kitchen appliances this week. Visit our showroom or reply for catalog.',
    },
  };

  const [editableTemplateText, setEditableTemplateText] = useState(
    templates.service_invoice.rawText
  );

  const handleSelectTemplate = (key: keyof typeof templates) => {
    setSelectedTemplateKey(key);
    setEditableTemplateText(templates[key].rawText);
  };

  const businessName = currentBusiness === 'sadat' ? 'SADAT ELECTRONICS' : 'AK TRADERS';

  // Live compiled text with replaced placeholders
  const compiledMessage = editableTemplateText
    .replace(/{name}/g, recipientName)
    .replace(/{no}/g, customNo)
    .replace(/{amount}/g, customAmount)
    .replace(/{business}/g, businessName)
    .replace(/{tech}/g, customTech);

  // Send WhatsApp Action
  const handleSend = () => {
    if (!recipientPhone.trim()) {
      addToast('Recipient phone number is required', 'error');
      return;
    }

    sendWhatsAppMessage({
      recipientName,
      recipientPhone,
      templateType: templates[selectedTemplateKey].type,
      content: compiledMessage,
    });

    openWhatsAppLink(recipientPhone, compiledMessage);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp & Customer Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Send invoices, status updates and payment reminders directly to Pakistani mobile numbers
          </p>
        </div>

        <div className="flex p-1 bg-slate-200/70 rounded-xl">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Message Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Message History ({whatsappHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Template Selection & Live Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Template Selector Pills */}
            <div className="bg-white p-3.5 rounded-[14px] border border-[#E6ECF3] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Choose Communication Template
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(templates) as (keyof typeof templates)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTemplateKey === key
                        ? 'bg-[#1E6BFF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {templates[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Input Row */}
            <div className="bg-white p-5 rounded-[14px] border border-[#E6ECF3] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recipient & Placeholder Variables
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Recipient Name {'{name}'}
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WhatsApp Phone (03xx)
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Invoice / Ticket {'{no}'}
                  </label>
                  <input
                    type="text"
                    value={customNo}
                    onChange={(e) => setCustomNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Amount {'{amount}'}
                  </label>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Technician {'{tech}'}
                  </label>
                  <input
                    type="text"
                    value={customTech}
                    onChange={(e) => setCustomTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Editable Text Area */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Template Content (Editable)
                </label>
                <textarea
                  rows={4}
                  value={editableTemplateText}
                  onChange={(e) => setEditableTemplateText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium leading-relaxed focus:ring-1 focus:ring-[#1E6BFF]"
                />
              </div>
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="bg-[#EFEAE2] p-6 rounded-2xl border border-amber-200/50 shadow-inner space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Live WhatsApp Chat Bubble Preview
              </span>

              <div className="max-w-md bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-md border border-slate-200/60 relative">
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {compiledMessage}
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-2">
                  <span>12:45 PM</span>
                  <CheckCircle2 className="w-3 h-3 text-[#1E6BFF]" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSend}
                  className="py-3 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp (wa.me)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch Automation Toggles & Technical Notice (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Gateway Disclaimer Note */}
            <div className="bg-blue-50/80 rounded-[14px] border border-blue-200 p-4 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <Info className="w-4 h-4 text-[#1E6BFF]" />
                <span>Integration Protocol Notice</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Direct browser sending utilizes the WhatsApp Web/Mobile protocol (wa.me). Full unattended backend automation can be connected anytime to the official WhatsApp Business Cloud API or local Pakistani SMS gateways (e.g. TeleStax / Zong / Jazz Business).
              </p>
            </div>

            {/* Automation Settings Toggles */}
            <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="w-4 h-4 text-[#1E6BFF]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Notification Automation Toggles
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">
                    Send invoice automatically after POS sale
                  </span>
                  <input
                    type="checkbox"
                    checked={autoInvoice}
                    onChange={(e) => setAutoInvoice(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">
                    SMS on new service complaint registered
                  </span>
                  <input
                    type="checkbox"
                    checked={autoComplaint}
                    onChange={(e) => setAutoComplaint(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">
                    Alert technician via WhatsApp on job assignment
                  </span>
                  <input
                    type="checkbox"
                    checked={autoTechAssign}
                    onChange={(e) => setAutoTechAssign(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">
                    Weekly wholesale dealer payment reminder (Monday)
                  </span>
                  <input
                    type="checkbox"
                    checked={autoWeeklyDealer}
                    onChange={(e) => setAutoWeeklyDealer(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">
                    Low stock alert notification to store manager
                  </span>
                  <input
                    type="checkbox"
                    checked={autoLowStock}
                    onChange={(e) => setAutoLowStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E6BFF] focus:ring-[#1E6BFF]"
                  />
                </label>
              </div>

              <div className="pt-2 text-[11px] text-slate-400">
                Preferences stored locally in current user session
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MESSAGE HISTORY TAB */
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Message Type</th>
                  <th className="py-3 px-4">Content Preview</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {whatsappHistory.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {msg.recipientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{msg.recipientName}</p>
                          <p className="text-[11px] text-slate-400">{msg.recipientPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {msg.templateType}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {msg.content}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {formatDateTime(msg.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
