import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Dealer, Dispatch, DispatchItem, DealerPayment, Product } from '../../types';
import { formatPKR, formatDate, openWhatsAppLink } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Receipt,
  Share2,
  Calendar,
  Building2,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  CreditCard,
} from 'lucide-react';

export const WholesaleScreen: React.FC = () => {
  const {
    dealers,
    products,
    dispatches,
    dealerPayments,
    returns,
    selectedMonth,
    addDispatch,
    addDealerPayment,
    addDealerReturn,
    getDealerBalance,
    getProductStock,
    addDealer,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dealers' | 'dispatches' | 'recoveries'>('dealers');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Dealer for Detailed Khata / Ledger
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAddDealerModalOpen, setIsAddDealerModalOpen] = useState(false);

  // Dispatch Form State
  const [dispatchDealerId, setDispatchDealerId] = useState<string>(dealers[0]?.id || '');
  const [dispatchDate, setDispatchDate] = useState<string>('2026-10-12');
  const [dispatchTerms, setDispatchTerms] = useState<number>(30);
  const [dispatchLines, setDispatchLines] = useState<{ product: Product; qty: number }[]>([]);
  const [dispatchPaidNow, setDispatchPaidNow] = useState<string>('0');
  const [dispatchBiltyNo, setDispatchBiltyNo] = useState<string>('');

  // Payment Form State
  const [payDealerId, setPayDealerId] = useState<string>(dealers[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(100000);
  const [payMethod, setPayMethod] = useState<DealerPayment['method']>('Meezan Bank');
  const [payRefNo, setPayRefNo] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Return Form State
  const [retDealerId, setRetDealerId] = useState<string>(dealers[0]?.id || '');
  const [retDispatchId, setRetDispatchId] = useState<string>('');
  const [retProductId, setRetProductId] = useState<string>('');
  const [retQty, setRetQty] = useState<number>(1);
  const [retReason, setRetReason] = useState<string>('');

  // Add Dealer Form State
  const [newDealerName, setNewDealerName] = useState('');
  const [newDealerContact, setNewDealerContact] = useState('');
  const [newDealerPhone, setNewDealerPhone] = useState('');
  const [newDealerCity, setNewDealerCity] = useState('Karachi');
  const [newDealerAddress, setNewDealerAddress] = useState('');
  const [newDealerOpeningBal, setNewDealerOpeningBal] = useState<number>(0);
  const [newDealerTerms, setNewDealerTerms] = useState<number>(30);

  // Selected Dealer Object
  const selectedDealer = useMemo(() => {
    return dealers.find((d) => d.id === selectedDealerId) || null;
  }, [dealers, selectedDealerId]);

  // Overall Recovery Metrics & Donut Chart
  const recoveryMetrics = useMemo(() => {
    const totalOpening = dealers.reduce((sum, d) => sum + (d.openingBalance || 0), 0);
    const totalDispatchesVal = dispatches.reduce((sum, d) => sum + d.total, 0);
    const totalPaidAtDispatch = dispatches.reduce((sum, d) => sum + (d.amountPaidNow || 0), 0);
    const totalPaymentsReceived = dealerPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalReturns = returns
      .filter((r) => r.type === 'Wholesale')
      .reduce((sum, r) => sum + r.refundOrCreditAmount, 0);

    const totalBilledDebt = totalOpening + totalDispatchesVal;
    const totalCollected = totalPaidAtDispatch + totalPaymentsReceived + totalReturns;
    const totalOutstanding = Math.max(0, totalBilledDebt - totalCollected);

    const recoveryPercent = totalBilledDebt > 0 ? Math.round((totalCollected / totalBilledDebt) * 100) : 0;

    return {
      totalBilledDebt,
      totalCollected,
      totalOutstanding,
      recoveryPercent,
    };
  }, [dealers, dispatches, dealerPayments, returns]);

  const recoveryDonutData = [
    { name: 'Collected', value: recoveryMetrics.totalCollected, color: '#16A34A' },
    { name: 'Outstanding Khata', value: recoveryMetrics.totalOutstanding, color: '#EF4444' },
  ];

  // Dealers Table Data with calculated numbers
  const dealersTableData = useMemo(() => {
    return dealers.map((dealer) => {
      const dealerDispatches = dispatches.filter((d) => d.dealerId === dealer.id);
      const totalDispatch = dealerDispatches.reduce((sum, d) => sum + d.total, 0);
      const paidAtDispatch = dealerDispatches.reduce((sum, d) => sum + (d.amountPaidNow || 0), 0);
      const dealerPays = dealerPayments.filter((p) => p.dealerId === dealer.id);
      const totalPayments = paidAtDispatch + dealerPays.reduce((sum, p) => sum + p.amount, 0);
      const currentBalance = getDealerBalance(dealer.id);

      const totalReceivable = dealer.openingBalance + totalDispatch;
      const recoveryRate = totalReceivable > 0 ? Math.round((totalPayments / totalReceivable) * 100) : 100;

      return {
        dealer,
        openingBalance: dealer.openingBalance,
        totalDispatch,
        totalPayments,
        currentBalance,
        recoveryRate,
      };
    });
  }, [dealers, dispatches, dealerPayments, getDealerBalance]);

  // Filtered dealers
  const filteredDealers = useMemo(() => {
    return dealersTableData.filter(
      (item) =>
        item.dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dealer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dealer.phone.includes(searchQuery)
    );
  }, [dealersTableData, searchQuery]);

  // Dealer Detail Khata Ledger Items (sorted chronologically with running balance)
  const dealerLedgerTimeline = useMemo(() => {
    if (!selectedDealer) return [];

    type LedgerEntry = {
      date: string;
      type: 'Opening' | 'Dispatch' | 'Payment' | 'Return';
      refId: string;
      description: string;
      debit: number; // Dispatches (increases owed)
      credit: number; // Payments & Returns (reduces owed)
      balance: number;
    };

    const entries: LedgerEntry[] = [];

    // Opening Balance
    entries.push({
      date: selectedDealer.createdAt || '2026-05-01',
      type: 'Opening',
      refId: 'OB-001',
      description: 'Opening Balance (Forwarded)',
      debit: selectedDealer.openingBalance,
      credit: 0,
      balance: selectedDealer.openingBalance,
    });

    // Dispatches
    dispatches
      .filter((d) => d.dealerId === selectedDealer.id)
      .forEach((d) => {
        entries.push({
          date: d.date,
          type: 'Dispatch',
          refId: d.id,
          description: `Dispatch: ${d.items.map((i) => `${i.productName} (${i.qty})`).join(', ')}`,
          debit: d.total,
          credit: d.amountPaidNow || 0,
          balance: 0, // calculated below
        });
      });

    // Payments
    dealerPayments
      .filter((p) => p.dealerId === selectedDealer.id)
      .forEach((p) => {
        entries.push({
          date: p.date,
          type: 'Payment',
          refId: p.id,
          description: `Payment received via ${p.method}${p.referenceNo ? ` (Ref: ${p.referenceNo})` : ''}`,
          debit: 0,
          credit: p.amount,
          balance: 0,
        });
      });

    // Returns
    returns
      .filter((r) => r.partyId === selectedDealer.id && r.type === 'Wholesale')
      .forEach((r) => {
        entries.push({
          date: r.date,
          type: 'Return',
          refId: r.id,
          description: `Returned ${r.productName} (${r.qty} units) - ${r.reason}`,
          debit: 0,
          credit: r.refundOrCreditAmount,
          balance: 0,
        });
      });

    // Sort by date ascending
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let running = 0;
    entries.forEach((e) => {
      running += e.debit - e.credit;
      e.balance = Math.max(0, running);
    });

    return entries;
  }, [selectedDealer, dispatches, dealerPayments, returns]);

  // Payment method totals for recovery tab
  const paymentMethodTotals = useMemo(() => {
    const methods: Record<DealerPayment['method'], number> = {
      Cash: 0,
      'Meezan Bank': 0,
      HBL: 0,
      JazzCash: 0,
      Easypaisa: 0,
      Cheque: 0,
    };

    dealerPayments.forEach((p) => {
      if (methods[p.method] !== undefined) {
        methods[p.method] += p.amount;
      }
    });

    return methods;
  }, [dealerPayments]);

  // Only kitchen appliances for wholesale dispatch
  const kitchenProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Kitchen Appliances');
  }, [products]);

  // Add line to dispatch
  const handleAddDispatchLine = (product: Product) => {
    const stock = getProductStock(product.id);
    if (stock.godown <= 0) {
      alert(`No godown stock available for ${product.name}`);
      return;
    }
    const existing = dispatchLines.find((l) => l.product.id === product.id);
    if (existing) {
      if (existing.qty + 1 > stock.godown) return;
      setDispatchLines((prev) =>
        prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      );
    } else {
      setDispatchLines([...dispatchLines, { product, qty: 1 }]);
    }
  };

  // Dispatch calculations
  const dispatchSubtotal = dispatchLines.reduce(
    (sum, l) => sum + l.product.wholesalePrice * l.qty,
    0
  );
  const paidNowVal = Math.min(dispatchSubtotal, Math.max(0, Number(dispatchPaidNow) || 0));
  const dispatchBalance = Math.max(0, dispatchSubtotal - paidNowVal);

  // Submit Dispatch
  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchLines.length === 0) return;
    const targetDealer = dealers.find((d) => d.id === dispatchDealerId);
    if (!targetDealer) return;

    const items: DispatchItem[] = dispatchLines.map((l) => ({
      productId: l.product.id,
      productName: l.product.name,
      qty: l.qty,
      unitWholesalePrice: l.product.wholesalePrice,
      unitCost: l.product.costPrice,
      total: l.product.wholesalePrice * l.qty,
    }));

    // Calculate due date
    const d = new Date(dispatchDate);
    d.setDate(d.getDate() + Number(dispatchTerms));
    const dueDate = d.toISOString().split('T')[0];

    const status: Dispatch['status'] =
      dispatchBalance === 0 ? 'Paid' : paidNowVal > 0 ? 'Partially Paid' : 'Dispatched';

    addDispatch({
      date: dispatchDate,
      dealerId: targetDealer.id,
      dealerName: targetDealer.name,
      items,
      subtotal: dispatchSubtotal,
      total: dispatchSubtotal,
      creditTermsDays: Number(dispatchTerms),
      dueDate,
      amountPaidNow: paidNowVal,
      balanceAmount: dispatchBalance,
      status,
      vehicleOrBiltyNo: dispatchBiltyNo || 'Karachi Goods Transport',
    });

    setIsDispatchModalOpen(false);
    setDispatchLines([]);
    setDispatchPaidNow('0');
  };

  // Submit Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDealer = dealers.find((d) => d.id === payDealerId);
    if (!targetDealer) return;

    addDealerPayment({
      date: '2026-10-12',
      dealerId: targetDealer.id,
      dealerName: targetDealer.name,
      amount: Number(payAmount),
      method: payMethod,
      referenceNo: payRefNo,
      notes: payNotes,
    });

    setIsPaymentModalOpen(false);
    setPayNotes('');
    setPayRefNo('');
  };

  // Submit Dealer Return
  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    addDealerReturn(retDispatchId || 'AK-DIRECT', retDealerId, retProductId, retQty, retReason);
    setIsReturnModalOpen(false);
    setRetReason('');
  };

  // Submit Add Dealer
  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealerName.trim()) return;

    const created = addDealer({
      name: newDealerName.trim(),
      contactPerson: newDealerContact.trim() || newDealerName.trim(),
      phone: newDealerPhone.trim(),
      city: newDealerCity.trim(),
      address: newDealerAddress.trim() || 'Karachi, Pakistan',
      openingBalance: Number(newDealerOpeningBal) || 0,
      creditTermsDays: Number(newDealerTerms) || 30,
    });

    setIsAddDealerModalOpen(false);
    setSelectedDealerId(created.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Wholesale Distribution & Dealer Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              AK Traders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bulk kitchen appliances supply, khata running ledger & inter-city recovery tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setDispatchDealerId(selectedDealerId || dealers[0]?.id || '');
              setIsDispatchModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>+ New Dispatch</span>
          </button>

          <button
            onClick={() => {
              setPayDealerId(selectedDealerId || dealers[0]?.id || '');
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Receive Payment</span>
          </button>

          <button
            onClick={() => setIsAddDealerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>+ Add Dealer</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-200/80 rounded-xl gap-1">
          <button
            onClick={() => {
              setActiveTab('dealers');
              setSelectedDealerId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'dealers' && !selectedDealerId
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Dealer Ledger ({dealers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('dispatches');
              setSelectedDealerId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'dispatches'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Dispatch History ({dispatches.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('recoveries');
              setSelectedDealerId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'recoveries'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Bank & Cash Recoveries ({dealerPayments.length})
          </button>
        </div>
      </div>

      {/* VIEW: DEALER DETAIL KHATA (When a dealer is selected) */}
      {selectedDealer ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Breadcrumb & Dealer Profile Header Card */}
          <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setSelectedDealerId(null)}
                className="text-xs font-bold text-[#1E6BFF] hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to All Dealers List
              </button>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedDealer.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                  {selectedDealer.city}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                <span>Contact: {selectedDealer.contactPerson} ({selectedDealer.phone})</span>
                <span>• Credit Terms: {selectedDealer.creditTermsDays} Days</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Current Khata Balance
                </span>
                <span className="text-2xl font-black text-rose-600 tabular-nums block">
                  {formatPKR(getDealerBalance(selectedDealer.id))}
                </span>
              </div>

              <button
                onClick={() => {
                  const bal = getDealerBalance(selectedDealer.id);
                  const text = `Respected ${selectedDealer.name}, this is a ledger payment reminder from AK TRADERS, Karachi. Your outstanding balance is ${formatPKR(bal)}. Kindly process recovery payment at earliest. Thank you.`;
                  openWhatsAppLink(selectedDealer.phone, text);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Reminder</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Official Account Ledger (Running Khata Statement)
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {dealerLedgerTimeline.length} transactions recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Debit (Dispatch)</th>
                    <th className="py-3 px-4 text-right">Credit (Received)</th>
                    <th className="py-3 px-4 text-right font-black">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dealerLedgerTimeline.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{entry.refId}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.type === 'Dispatch'
                              ? 'bg-blue-100 text-blue-700'
                              : entry.type === 'Payment'
                              ? 'bg-emerald-100 text-emerald-700'
                              : entry.type === 'Return'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{entry.description}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {entry.debit > 0 ? formatPKR(entry.debit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                        {entry.credit > 0 ? formatPKR(entry.credit) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-extrabold text-slate-900">
                        {formatPKR(entry.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'dealers' ? (
        /* MAIN DEALER LEDGER PAGE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search dealer by name, city, phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1E6BFF] shadow-2xs"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold text-slate-800">Dealer Name</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-800">Opening Bal</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-800">Total Dispatch</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-800">Received</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-800">Balance</th>
                      <th className="py-3.5 px-4 text-center font-bold text-slate-800">Recovery %</th>
                      <th className="py-3.5 px-4 text-right font-bold text-slate-800">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredDealers.map((item) => (
                      <tr
                        key={item.dealer.id}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-sm">{item.dealer.name}</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            {item.dealer.city} • {item.dealer.phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700 tabular-nums">
                          {formatPKR(item.openingBalance)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                          {formatPKR(item.totalDispatch)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                          {formatPKR(item.totalPayments)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black tabular-nums">
                          <span
                            className={item.currentBalance > 0 ? 'text-rose-600 font-black' : 'text-slate-500 font-semibold'}
                          >
                            {formatPKR(item.currentBalance)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.recoveryRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedDealerId(item.dealer.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all border border-blue-200/80 shadow-2xs"
                          >
                            View Khata
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Card: Recovery Tracking Donut (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-[14px] border border-[#E6ECF3] shadow-md p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recovery Tracking</h3>
              <p className="text-xs text-slate-500">
                Dealer collection progress across Sindh & Karachi network
              </p>
            </div>

            <div className="relative h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recoveryDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {recoveryDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">
                  {recoveryMetrics.recoveryPercent}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Collected
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Total Receivables:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatPKR(recoveryMetrics.totalBilledDebt)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Total Collected:</span>
                <span className="tabular-nums">
                  {formatPKR(recoveryMetrics.totalCollected)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-rose-600 pt-1 border-t border-slate-100">
                <span>Outstanding Khata:</span>
                <span className="tabular-nums">
                  {formatPKR(recoveryMetrics.totalOutstanding)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Receive Recovery Payment</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'dispatches' ? (
        /* DISPATCHES TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold text-slate-800">Dispatch #</th>
                  <th className="py-3.5 px-4 font-bold text-slate-800">Date</th>
                  <th className="py-3.5 px-4 font-bold text-slate-800">Dealer</th>
                  <th className="py-3.5 px-4 font-bold text-slate-800">Items</th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-800">Total</th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-800">Paid Now</th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-800">Balance</th>
                  <th className="py-3.5 px-4 text-center font-bold text-slate-800">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.id}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-normal">{formatDate(d.date)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.dealerName}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {d.items.map((i) => `${i.productName} (${i.qty})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 tabular-nums">
                      {formatPKR(d.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-bold tabular-nums">
                      {formatPKR(d.amountPaidNow)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 tabular-nums">
                      {formatPKR(d.balanceAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          d.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : d.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedDealerId(d.dealerId)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors border border-blue-200/80"
                      >
                        Khata
                      </button>
                      <button
                        onClick={() => {
                          setRetDealerId(d.dealerId);
                          setRetDispatchId(d.id);
                          setRetProductId(d.items[0]?.productId || '');
                          setIsReturnModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors border border-slate-200"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RECOVERIES LIST WITH PAYMENT METHODS */
        <div className="space-y-6">
          {/* Method Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(paymentMethodTotals).map(([method, amount]) => (
              <div
                key={method}
                className="bg-white p-3 rounded-xl border border-[#E6ECF3] shadow-xs text-center"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {method}
                </span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums mt-1 block">
                  {formatPKR(amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Dealer</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Ref / Cheque #</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dealerPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.id}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(p.date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.dealerName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {p.referenceNo || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700 tabular-nums">
                        {formatPKR(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-[180px]">
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW DISPATCH MODAL */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Issue Wholesale Dispatch"
        subtitle="Kitchen appliances distribution at wholesale rates to dealer"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveDispatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Dealer *
              </label>
              <select
                value={dispatchDealerId}
                onChange={(e) => setDispatchDealerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Credit Terms (Days)
              </label>
              <input
                type="number"
                value={dispatchTerms}
                onChange={(e) => setDispatchTerms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Transport / Bilty #
              </label>
              <input
                type="text"
                placeholder="Vehicle or Bilty Ref"
                value={dispatchBiltyNo}
                onChange={(e) => setDispatchBiltyNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          {/* Kitchen Product Selection Quick Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Available Kitchen Wholesale Inventory (Click to add)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
              {kitchenProducts.map((p) => {
                const stock = getProductStock(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddDispatchLine(p)}
                    className="p-2 rounded-xl border border-slate-200 text-left hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all text-xs"
                  >
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[#1E6BFF] font-bold tabular-nums">
                        {formatPKR(p.wholesalePrice)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Godown: {stock.godown}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dispatch Lines Cart */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Dispatch Manifest Items ({dispatchLines.length})
            </span>
            {dispatchLines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <span className="font-bold text-slate-900">{line.product.name}</span>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums font-semibold text-slate-600">
                    {formatPKR(line.product.wholesalePrice)} × {line.qty}
                  </span>
                  <span className="font-extrabold text-slate-900 tabular-nums">
                    {formatPKR(line.product.wholesalePrice * line.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDispatchLines(dispatchLines.filter((_, i) => i !== idx))
                    }
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Upfront Payment */}
          <div className="p-3.5 rounded-xl bg-slate-100 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Dispatch Value:</span>
              <span className="text-[#1E6BFF] tabular-nums">{formatPKR(dispatchSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Advance Paid at Dispatch (Rs.):</span>
              <input
                type="number"
                min="0"
                max={dispatchSubtotal}
                value={dispatchPaidNow}
                onChange={(e) => setDispatchPaidNow(e.target.value)}
                className="w-32 px-2.5 py-1 rounded-lg border border-slate-300 text-right font-extrabold text-slate-900 tabular-nums"
              />
            </div>
            <div className="flex justify-between font-extrabold text-rose-600 pt-1 border-t border-slate-200">
              <span>Debit to Dealer Khata:</span>
              <span className="tabular-nums">{formatPKR(dispatchBalance)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={dispatchLines.length === 0}
              className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:bg-slate-300"
            >
              Issue Dispatch & Update Godown
            </button>
          </div>
        </form>
      </Modal>

      {/* RECEIVE DEALER PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Dealer Recovery Payment"
        subtitle="Credits payment to dealer's ledger statement"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Dealer *
            </label>
            <select
              value={payDealerId}
              onChange={(e) => setPayDealerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Balance: {formatPKR(getDealerBalance(d.id))})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Amount Received (Rs.) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Payment Method *
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              <option value="Meezan Bank">Meezan Bank</option>
              <option value="HBL">HBL</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Cheque # / Online Reference
            </label>
            <input
              type="text"
              placeholder="e.g. FT-992102 or CHQ-48192"
              value={payRefNo}
              onChange={(e) => setPayRefNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="Notes on recovery officer or clearance"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Post Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* DEALER RETURN MODAL */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Dealer Return"
        subtitle="Credits dealer balance and restores inventory to Godown"
      >
        <form onSubmit={handleSaveReturn} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Select Product to Return *
            </label>
            <select
              value={retProductId}
              onChange={(e) => setRetProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              {kitchenProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatPKR(p.wholesalePrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Quantity to Return
            </label>
            <input
              type="number"
              min="1"
              value={retQty}
              onChange={(e) => setRetQty(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason for Return
            </label>
            <textarea
              required
              rows={2}
              value={retReason}
              onChange={(e) => setRetReason(e.target.value)}
              placeholder="e.g. Factory baffle plate damage, returned for credit"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Confirm Return & Credit Khata
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD NEW DEALER MODAL */}
      <Modal
        isOpen={isAddDealerModalOpen}
        onClose={() => setIsAddDealerModalOpen(false)}
        title="Add New Wholesale Dealer"
        subtitle="Register shopkeeper / dealer with opening credit balance"
      >
        <form onSubmit={handleCreateDealer} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Dealer Business Name *
            </label>
            <input
              type="text"
              required
              value={newDealerName}
              onChange={(e) => setNewDealerName(e.target.value)}
              placeholder="e.g. Qadri Kitchens & Electronics"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={newDealerContact}
                onChange={(e) => setNewDealerContact(e.target.value)}
                placeholder="Owner / Manager"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={newDealerPhone}
                onChange={(e) => setNewDealerPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                City / Market
              </label>
              <input
                type="text"
                value={newDealerCity}
                onChange={(e) => setNewDealerCity(e.target.value)}
                placeholder="Karachi / Hyderabad"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Credit Terms (Days)
              </label>
              <input
                type="number"
                value={newDealerTerms}
                onChange={(e) => setNewDealerTerms(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Opening Balance (Rs.)
            </label>
            <input
              type="number"
              value={newDealerOpeningBal}
              onChange={(e) => setNewDealerOpeningBal(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddDealerModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Dealer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
