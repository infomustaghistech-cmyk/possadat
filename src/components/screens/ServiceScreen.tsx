import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, ServiceInvoice, ServicePartUsed, Technician } from '../../types';
import { formatPKR, formatDate, openWhatsAppLink } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Wrench,
  Plus,
  Search,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Receipt,
  Share2,
  Trash2,
  ShieldAlert,
  Sliders,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export const ServiceScreen: React.FC = () => {
  const {
    complaints,
    technicians,
    customers,
    serviceInvoices,
    selectedMonth,
    addComplaint,
    updateComplaintStatus,
    assignComplaintTechnician,
    createRecomplaint,
    createServiceInvoice,
    addTechnician,
    updateTechnician,
    addToast,
  } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<'complaints' | 'technicians'>('complaints');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for the Right Details Panel
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(
    complaints[0]?.id || ''
  );

  // Modals state
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecomplaintOpen, setIsRecomplaintOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  // New Complaint Form
  const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || '');
  const [formAppliance, setFormAppliance] = useState('Gree 1.5 Ton Inverter AC');
  const [formBrand, setFormBrand] = useState('Gree');
  const [formModelSerial, setFormModelSerial] = useState('');
  const [formIssue, setFormIssue] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Normal' | 'High'>('Normal');
  const [formTechId, setFormTechId] = useState('');
  const [formVisitDate, setFormVisitDate] = useState('2026-10-12');

  // Re-complaint Form
  const [recomplaintIssue, setRecomplaintIssue] = useState('');

  // Service Invoice Form
  const [invServiceCharge, setInvServiceCharge] = useState<number>(3000);
  const [invParts, setInvParts] = useState<ServicePartUsed[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState<number>(0);
  const [newPartPrice, setNewPartPrice] = useState<number>(0);
  const [invPaidStatus, setInvPaidStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [invPaymentMethod, setInvPaymentMethod] = useState<'Cash' | 'Bank / Online'>('Cash');

  // Technician Form
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [techSpeciality, setTechSpeciality] = useState<any>('Air Conditioner');
  const [techCommission, setTechCommission] = useState<number>(30);

  // Selected Complaint Object
  const selectedComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedComplaintId) || complaints[0];
  }, [complaints, selectedComplaintId]);

  // Status Tabs Counts
  const statusCounts = useMemo(() => {
    return {
      All: complaints.length,
      New: complaints.filter((c) => c.status === 'New').length,
      Assigned: complaints.filter((c) => c.status === 'Assigned').length,
      'In Progress': complaints.filter((c) => c.status === 'In Progress').length,
      'Waiting Parts': complaints.filter((c) => c.status === 'Waiting Parts').length,
      Completed: complaints.filter((c) => c.status === 'Completed').length,
      Closed: complaints.filter((c) => c.status === 'Closed').length,
    };
  }, [complaints]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.appliance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.issue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [complaints, statusFilter, searchQuery]);

  // Technicians Monthly Stats
  const technicianStats = useMemo(() => {
    return technicians.map((tech) => {
      const monthInvoices = serviceInvoices.filter(
        (inv) => inv.technicianId === tech.id && inv.date.startsWith(selectedMonth)
      );
      const openJobs = complaints.filter(
        (c) =>
          c.technicianId === tech.id &&
          c.status !== 'Closed' &&
          c.status !== 'Completed'
      ).length;

      const jobsBilled = monthInvoices.length;
      const cashBroughtIn = monthInvoices
        .filter((i) => i.paidStatus === 'Paid')
        .reduce((sum, i) => sum + i.totalBill, 0);
      const pendingAmount = monthInvoices
        .filter((i) => i.paidStatus === 'Pending')
        .reduce((sum, i) => sum + i.totalBill, 0);
      const commissionEarned = monthInvoices.reduce(
        (sum, i) => sum + i.commissionAmount,
        0
      );
      const shopProfitGen = monthInvoices.reduce(
        (sum, i) => sum + i.shopProfit,
        0
      );
      const reComplaintsCount = complaints.filter(
        (c) => c.technicianId === tech.id && c.isRecomplaint
      ).length;

      return {
        tech,
        jobsBilled,
        openJobs,
        cashBroughtIn,
        pendingAmount,
        commissionEarned,
        shopProfitGen,
        reComplaintsCount,
      };
    });
  }, [technicians, serviceInvoices, complaints, selectedMonth]);

  // Auto-suggest technician when appliance changes in new complaint
  const handleApplianceChange = (val: string) => {
    setFormAppliance(val);
    const lower = val.toLowerCase();
    let suggested: Technician | undefined;
    if (lower.includes('ac') || lower.includes('conditioner')) {
      suggested = technicians.find((t) => t.speciality === 'Air Conditioner');
    } else if (lower.includes('fridge') || lower.includes('refrigerat')) {
      suggested = technicians.find((t) => t.speciality === 'Refrigerator');
    } else if (lower.includes('wash') || lower.includes('tub')) {
      suggested = technicians.find((t) => t.speciality === 'Washing Machine');
    } else if (lower.includes('hob') || lower.includes('hood') || lower.includes('range') || lower.includes('oven')) {
      suggested = technicians.find((t) => t.speciality === 'Kitchen Appliances');
    } else if (lower.includes('tv') || lower.includes('led')) {
      suggested = technicians.find((t) => t.speciality === 'LED TV');
    }
    if (suggested) {
      setFormTechId(suggested.id);
    }
  };

  // Submit New Complaint
  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formCustomerId);
    if (!cust) return;

    const tech = technicians.find((t) => t.id === formTechId);

    const created = addComplaint({
      date: '2026-10-12',
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      appliance: formAppliance,
      brand: formBrand,
      modelSerial: formModelSerial || 'N/A',
      issue: formIssue,
      priority: formPriority,
      technicianId: tech?.id,
      technicianName: tech?.name,
      visitDate: formVisitDate,
      status: tech ? 'Assigned' : 'New',
    });

    setSelectedComplaintId(created.id);
    setIsNewComplaintOpen(false);
    setFormIssue('');
    setFormModelSerial('');
  };

  // Submit Re-complaint
  const handleLogRecomplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const recomp = createRecomplaint(selectedComplaint.id, recomplaintIssue);
    setSelectedComplaintId(recomp.id);
    setIsRecomplaintOpen(false);
    setRecomplaintIssue('');
  };

  // Add Part line to Invoice
  const handleAddPartToInvoice = () => {
    if (!newPartName.trim()) return;
    setInvParts([
      ...invParts,
      {
        partName: newPartName.trim(),
        cost: Number(newPartCost) || 0,
        priceCharged: Number(newPartPrice) || 0,
      },
    ]);
    setNewPartName('');
    setNewPartCost(0);
    setNewPartPrice(0);
  };

  // Invoice calculations
  const totalPartsCost = invParts.reduce((sum, p) => sum + p.cost, 0);
  const totalPartsPrice = invParts.reduce((sum, p) => sum + p.priceCharged, 0);
  const totalBill = invServiceCharge + totalPartsPrice;

  // Selected tech for invoice
  const invTech = technicians.find(
    (t) => t.id === selectedComplaint?.technicianId
  ) || technicians[0];
  const commissionRate = invTech.commissionRate;
  const commissionAmount = (invServiceCharge * commissionRate) / 100;
  const shopProfit = invServiceCharge + totalPartsPrice - totalPartsCost - commissionAmount;

  // Submit Invoice
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    createServiceInvoice({
      complaintId: selectedComplaint.id,
      date: '2026-10-12',
      customerId: selectedComplaint.customerId,
      customerName: selectedComplaint.customerName,
      technicianId: invTech.id,
      technicianName: invTech.name,
      serviceCharge: invServiceCharge,
      parts: invParts,
      partsCost: totalPartsCost,
      partsPrice: totalPartsPrice,
      totalBill,
      commissionRate,
      commissionAmount,
      shopProfit,
      paidStatus: invPaidStatus,
      paymentMethod: invPaymentMethod,
    });

    setIsCreateInvoiceOpen(false);
    setInvParts([]);
  };

  // Save/Edit Tech
  const handleSaveTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) return;

    if (editingTech) {
      updateTechnician({
        ...editingTech,
        name: techName.trim(),
        phone: techPhone.trim(),
        speciality: techSpeciality,
        commissionRate: Number(techCommission),
      });
    } else {
      addTechnician({
        name: techName.trim(),
        phone: techPhone.trim(),
        speciality: techSpeciality,
        commissionRate: Number(techCommission),
        status: 'Active',
      });
    }

    setIsTechModalOpen(false);
    setEditingTech(null);
    setTechName('');
    setTechPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workshop & Service Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage complaints, assign field technicians, track parts & calculate workshop profit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveMainTab('complaints')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'complaints'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Complaints Pipeline
            </button>
            <button
              onClick={() => setActiveMainTab('technicians')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'technicians'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Technicians Performance
            </button>
          </div>

          <button
            onClick={() => setIsNewComplaintOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Complaint</span>
          </button>
        </div>
      </div>

      {activeMainTab === 'complaints' ? (
        <div className="space-y-4">
          {/* Status Tabs with Live Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  statusFilter === status
                    ? 'bg-[#1E6BFF] text-white shadow-xs'
                    : 'bg-white border border-[#E6ECF3] text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === status
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by complaint #, customer name, appliance, issue description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6ECF3] bg-white text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#1E6BFF]"
            />
          </div>

          {/* Main 2-Column Layout: Table (8 cols) + Right Job Details Panel (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table & Mobile Cards */}
            <div className="lg:col-span-8 bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
              {/* Mobile Card List */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No service complaints found for this status.
                  </div>
                ) : (
                  filteredComplaints.map((c) => {
                    const isSelected = selectedComplaint?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedComplaintId(c.id)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EBF2F7]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{c.id}</span>
                            {c.isRecomplaint && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                                Re
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">{c.appliance}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[190px]">{c.issue}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              c.status === 'New'
                                ? 'bg-blue-100 text-blue-700'
                                : c.status === 'Assigned'
                                ? 'bg-purple-100 text-purple-700'
                                : c.status === 'In Progress'
                                ? 'bg-sky-100 text-sky-700'
                                : c.status === 'Waiting Parts'
                                ? 'bg-amber-100 text-amber-700'
                                : c.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{c.customerName}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Complaint #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Appliance</th>
                      <th className="py-3 px-4">Issue</th>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No service complaints found for this status.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c) => {
                        const isSelected = selectedComplaint?.id === c.id;
                        return (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedComplaintId(c.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{c.id}</span>
                                {c.isRecomplaint && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700">
                                    Re-complaint
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{c.customerName}</p>
                              <p className="text-[11px] text-slate-400">{c.customerPhone}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-800 font-semibold truncate max-w-[140px]">
                              {c.appliance}
                            </td>
                            <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">
                              {c.issue}
                            </td>
                            <td className="py-3 px-4">
                              {c.technicianName ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {c.technicianName}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === 'New'
                                    ? 'bg-blue-100 text-blue-700'
                                    : c.status === 'Assigned'
                                    ? 'bg-purple-100 text-purple-700'
                                    : c.status === 'In Progress'
                                    ? 'bg-sky-100 text-sky-700'
                                    : c.status === 'Waiting Parts'
                                    ? 'bg-amber-100 text-amber-700'
                                    : c.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedComplaintId(c.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E6BFF] hover:bg-blue-100 font-bold text-[11px]"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side "Job Details" Panel */}
            <div className="lg:col-span-4 bg-white rounded-[14px] border border-[#E6ECF3] shadow-md p-5 space-y-4">
              {selectedComplaint ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {selectedComplaint.id}
                      </span>
                      {selectedComplaint.isRecomplaint && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Re-complaint of {selectedComplaint.parentComplaintId}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedComplaint.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedComplaint.priority === 'Normal'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Priority: {selectedComplaint.priority}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Customer Details
                    </span>
                    <p className="font-bold text-slate-900">{selectedComplaint.customerName}</p>
                    <p className="text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#1E6BFF]" />
                      <span>{selectedComplaint.customerPhone}</span>
                    </p>
                    <p className="text-slate-500">{selectedComplaint.customerAddress}</p>
                  </div>

                  {/* Appliance & Issue */}
                  <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Appliance & Problem
                    </span>
                    <p className="font-bold text-slate-900">{selectedComplaint.appliance}</p>
                    <p className="text-[11px] text-slate-500">
                      Brand: {selectedComplaint.brand} | Model: {selectedComplaint.modelSerial}
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 mt-1">
                      {selectedComplaint.issue}
                    </div>
                  </div>

                  {/* Assigned Technician */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">
                        Assigned Field Technician
                      </span>
                      {selectedComplaint.technicianName && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          Commission Rate: 30%
                        </span>
                      )}
                    </div>

                    <select
                      value={selectedComplaint.technicianId || ''}
                      onChange={(e) => assignComplaintTechnician(selectedComplaint.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50"
                    >
                      <option value="">-- Assign Technician --</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.speciality} - {t.commissionRate}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Status Updater */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Update Status
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Assigned', 'In Progress', 'Waiting Parts', 'Completed', 'Closed'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => updateComplaintStatus(selectedComplaint.id, st)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                              selectedComplaint.status === st
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {!selectedComplaint.invoiceId ? (
                      <button
                        onClick={() => {
                          setIsCreateInvoiceOpen(true);
                          setInvServiceCharge(3000);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Create Service Invoice</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                        <span>Invoice Billed: {selectedComplaint.invoiceId}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsRecomplaintOpen(true)}
                        className="py-2 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Log Re-complaint</span>
                      </button>

                      <button
                        onClick={() => {
                          const text = `Dear ${selectedComplaint.customerName}, regarding your complaint ${selectedComplaint.id} (${selectedComplaint.appliance}): current status is "${selectedComplaint.status}". Technician: ${selectedComplaint.technicianName || 'Sadat Team'}. Workshop: +92 21 34981122.`;
                          openWhatsAppLink(selectedComplaint.customerPhone, text);
                        }}
                        className="py-2 px-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Select a complaint from the table to view details.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TECHNICIANS PERFORMANCE SUB-PAGE */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Technician Roster & Monthly Metrics ({selectedMonth})
            </h3>
            <button
              onClick={() => {
                setEditingTech(null);
                setTechName('');
                setTechPhone('');
                setTechCommission(30);
                setIsTechModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-xs hover:bg-blue-600"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Technician</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {technicianStats.map((item) => (
              <div
                key={item.tech.id}
                className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {item.tech.name}
                      </h4>
                      <p className="text-xs text-slate-500">{item.tech.phone}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.tech.speciality}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Jobs Billed
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {item.jobsBilled}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Open Jobs
                      </span>
                      <span className="text-base font-extrabold text-amber-600">
                        {item.openJobs}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Cash Brought In
                      </span>
                      <span className="font-bold text-emerald-700 tabular-nums">
                        {formatPKR(item.cashBroughtIn)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Commission ({item.tech.commissionRate}%)
                      </span>
                      <span className="font-bold text-[#1E6BFF] tabular-nums">
                        {formatPKR(item.commissionEarned)}
                      </span>
                    </div>
                  </div>

                  {/* Shop profit generated */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Shop Profit Generated:</span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(item.shopProfitGen)}
                    </span>
                  </div>

                  {item.reComplaintsCount > 0 && (
                    <div className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{item.reComplaintsCount} re-complaints this period</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setEditingTech(item.tech);
                      setTechName(item.tech.name);
                      setTechPhone(item.tech.phone);
                      setTechSpeciality(item.tech.speciality);
                      setTechCommission(item.tech.commissionRate);
                      setIsTechModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#1E6BFF] hover:underline"
                  >
                    Edit Profile & Rate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW COMPLAINT MODAL */}
      <Modal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        title="Register New Service Complaint"
        subtitle="Log customer breakdown ticket and assign appropriate technician"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Customer *
              </label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.area})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Appliance / Product *
              </label>
              <input
                type="text"
                required
                value={formAppliance}
                onChange={(e) => handleApplianceChange(e.target.value)}
                placeholder="e.g. Gree 1.5 Ton Inverter AC"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Gree, Haier, Dawlance"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Model / Serial No
              </label>
              <input
                type="text"
                value={formModelSerial}
                onChange={(e) => setFormModelSerial(e.target.value)}
                placeholder="Serial barcode number"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Issue Reported by Customer *
            </label>
            <textarea
              required
              rows={2}
              value={formIssue}
              onChange={(e) => setFormIssue(e.target.value)}
              placeholder="Detailed description of defect or symptoms..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Technician (Auto-suggested)
              </label>
              <select
                value={formTechId}
                onChange={(e) => setFormTechId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="">-- Assign Later --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.speciality})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Visit Scheduled Date
              </label>
              <input
                type="date"
                value={formVisitDate}
                onChange={(e) => setFormVisitDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewComplaintOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Register Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* RE-COMPLAINT MODAL */}
      <Modal
        isOpen={isRecomplaintOpen}
        onClose={() => setIsRecomplaintOpen(false)}
        title="Log Re-complaint Ticket"
        subtitle={`Links recurring breakdown to original job ${selectedComplaint?.id}`}
      >
        <form onSubmit={handleLogRecomplaint} className="space-y-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-xs font-medium">
            This will create a new linked complaint with a red <span className="font-bold">Re-complaint</span> badge, re-assigning the original technician for priority inspection.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Recurring Problem Description *
            </label>
            <textarea
              required
              rows={3}
              value={recomplaintIssue}
              onChange={(e) => setRecomplaintIssue(e.target.value)}
              placeholder="e.g. Unit started leaking again after 10 days of initial repair..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRecomplaintOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Create Re-complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE SERVICE INVOICE MODAL */}
      <Modal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        title={`Create Service Invoice: ${selectedComplaint?.id}`}
        subtitle="Automatic calculation of Bill, Technician Commission & Shop Profit"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer:</span>
              <p className="font-bold text-slate-900">{selectedComplaint?.customerName}</p>
              <p className="text-slate-500">{selectedComplaint?.appliance}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Technician:</span>
              <p className="font-bold text-slate-900">{invTech.name}</p>
              <p className="text-slate-500">Commission Rate: {invTech.commissionRate}%</p>
            </div>
          </div>

          {/* Service Charge */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Labor / Service Charge (Rs.) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={invServiceCharge}
              onChange={(e) => setInvServiceCharge(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
            />
          </div>

          {/* Parts Used Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Replacement Spare Parts Used
            </span>

            {/* Add Part Line */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="Part Name (e.g. 35uF Capacitor)"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="sm:col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Cost (Our)"
                value={newPartCost || ''}
                onChange={(e) => setNewPartCost(Number(e.target.value))}
                className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Billed (Price)"
                value={newPartPrice || ''}
                onChange={(e) => setNewPartPrice(Number(e.target.value))}
                className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleAddPartToInvoice}
                className="sm:col-span-2 py-1.5 px-2 rounded-lg bg-[#1E6BFF] text-white text-xs font-bold"
              >
                + Add Part
              </button>
            </div>

            {/* Added Parts List */}
            {invParts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900">{p.partName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Cost: {formatPKR(p.cost)}</span>
                  <span className="font-bold text-slate-900">Billed: {formatPKR(p.priceCharged)}</span>
                  <button
                    type="button"
                    onClick={() => setInvParts(invParts.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulas Output Card */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Bill (Charge + Parts):</span>
              <span className="text-[#1E6BFF] tabular-nums">{formatPKR(totalBill)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Technician Commission ({commissionRate}% of charge):</span>
              <span className="tabular-nums font-semibold">{formatPKR(commissionAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
              <span>Shop Net Profit:</span>
              <span className="tabular-nums">{formatPKR(shopProfit)}</span>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Status
              </label>
              <select
                value={invPaidStatus}
                onChange={(e) => setInvPaidStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending (Khata)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Mode
              </label>
              <select
                value={invPaymentMethod}
                onChange={(e) => setInvPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="Cash">Cash</option>
                <option value="Bank / Online">Bank / Online</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateInvoiceOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Finalize Service Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD / EDIT TECHNICIAN MODAL */}
      <Modal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        title={editingTech ? 'Edit Technician' : 'Add New Technician'}
        subtitle="Manage specialist commission rates and contact details"
      >
        <form onSubmit={handleSaveTech} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Technician Name *
            </label>
            <input
              type="text"
              required
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="e.g. Aslam Pervez"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={techPhone}
              onChange={(e) => setTechPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Speciality
            </label>
            <select
              value={techSpeciality}
              onChange={(e) => setTechSpeciality(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              <option value="Air Conditioner">Air Conditioner</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Kitchen Appliances">Kitchen Appliances</option>
              <option value="LED TV">LED TV</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={techCommission}
              onChange={(e) => setTechCommission(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTechModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Technician
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
