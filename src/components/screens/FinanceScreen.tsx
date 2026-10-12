import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, BusinessId } from '../../types';
import { formatPKR, formatDate, exportToCSV } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  TrendingUp,
  Receipt,
  Download,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Building2,
  Store,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const FinanceScreen: React.FC = () => {
  const {
    currentBusiness,
    selectedMonth,
    sales,
    dispatches,
    serviceInvoices,
    expenses,
    returns,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'statement' | 'expenses'>('statement');
  const [viewScope, setViewScope] = useState<'current' | 'group'>('current');

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expBusinessId, setExpBusinessId] = useState<BusinessId>(currentBusiness);
  const [expCategory, setExpCategory] = useState<Expense['category']>('Rent');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(10000);
  const [expPaidFrom, setExpPaidFrom] = useState<Expense['paidFrom']>('Cash Drawer');
  const [expDate, setExpDate] = useState('2026-10-12');

  const expenseCategories = [
    'Rent',
    'Electricity',
    'Salaries',
    'Transport & Freight',
    'Fuel',
    'Internet & Phone',
    'Food & Refreshment',
    'Marketing',
    'Maintenance & Others',
  ] as const;

  // Monthly Financial Calculations
  const finData = useMemo(() => {
    const isGroup = viewScope === 'group';

    // Sales (Retail)
    const monthSales = sales.filter((s) => s.date.startsWith(selectedMonth));
    const retailGrossSales = (isGroup || currentBusiness === 'sadat')
      ? monthSales.reduce((sum, s) => sum + s.total, 0)
      : 0;

    const retailReturns = (isGroup || currentBusiness === 'sadat')
      ? returns
          .filter((r) => r.type === 'Retail' && r.date.startsWith(selectedMonth))
          .reduce((sum, r) => sum + r.refundOrCreditAmount, 0)
      : 0;

    const retailNetSales = Math.max(0, retailGrossSales - retailReturns);

    const retailCogs = (isGroup || currentBusiness === 'sadat')
      ? monthSales.reduce((sum, s) => {
          const cost = s.items.reduce((c, i) => c + i.unitCost * i.qty, 0);
          return sum + cost;
        }, 0)
      : 0;

    const retailProfit = (isGroup || currentBusiness === 'sadat')
      ? monthSales.reduce((sum, s) => sum + s.profit, 0)
      : 0;

    // Dispatches (Wholesale)
    const monthDispatches = dispatches.filter((d) => d.date.startsWith(selectedMonth));
    const wholesaleGrossSales = (isGroup || currentBusiness === 'ak')
      ? monthDispatches.reduce((sum, d) => sum + d.total, 0)
      : 0;

    const wholesaleReturns = (isGroup || currentBusiness === 'ak')
      ? returns
          .filter((r) => r.type === 'Wholesale' && r.date.startsWith(selectedMonth))
          .reduce((sum, r) => sum + r.refundOrCreditAmount, 0)
      : 0;

    const wholesaleNetSales = Math.max(0, wholesaleGrossSales - wholesaleReturns);

    const wholesaleCogs = (isGroup || currentBusiness === 'ak')
      ? monthDispatches.reduce((sum, d) => {
          const cost = d.items.reduce((c, i) => c + i.unitCost * i.qty, 0);
          return sum + cost;
        }, 0)
      : 0;

    const wholesaleProfit = Math.max(0, wholesaleNetSales - wholesaleCogs);

    // Workshop Service Invoices (Sadat only)
    const monthInvoices = serviceInvoices.filter((sv) => sv.date.startsWith(selectedMonth));
    const serviceChargesBilled = (isGroup || currentBusiness === 'sadat')
      ? monthInvoices.reduce((sum, sv) => sum + sv.serviceCharge, 0)
      : 0;

    const partsBilled = (isGroup || currentBusiness === 'sadat')
      ? monthInvoices.reduce((sum, sv) => sum + sv.partsPrice, 0)
      : 0;

    const partsCost = (isGroup || currentBusiness === 'sadat')
      ? monthInvoices.reduce((sum, sv) => sum + sv.partsCost, 0)
      : 0;

    const technicianCommission = (isGroup || currentBusiness === 'sadat')
      ? monthInvoices.reduce((sum, sv) => sum + sv.commissionAmount, 0)
      : 0;

    const serviceNetProfit = (isGroup || currentBusiness === 'sadat')
      ? monthInvoices.reduce((sum, sv) => sum + sv.shopProfit, 0)
      : 0;

    // Operating Expenses
    const monthExpenses = expenses.filter(
      (e) => e.date.startsWith(selectedMonth) && (isGroup || e.businessId === currentBusiness)
    );

    const totalOperatingExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Consolidated Total Revenue
    const totalRevenue = retailNetSales + wholesaleNetSales + serviceChargesBilled + partsBilled;
    const totalGrossProfit = retailProfit + wholesaleProfit + serviceNetProfit;
    const netProfit = totalGrossProfit - totalOperatingExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      retailGrossSales,
      retailReturns,
      retailNetSales,
      retailCogs,
      retailProfit,
      wholesaleGrossSales,
      wholesaleReturns,
      wholesaleNetSales,
      wholesaleCogs,
      wholesaleProfit,
      serviceChargesBilled,
      partsBilled,
      partsCost,
      technicianCommission,
      serviceNetProfit,
      monthExpenses,
      totalOperatingExpenses,
      totalRevenue,
      totalGrossProfit,
      netProfit,
      profitMargin,
    };
  }, [sales, dispatches, serviceInvoices, expenses, returns, selectedMonth, currentBusiness, viewScope]);

  // Expenses by Category breakdown for Donut
  const expenseBreakdown = useMemo(() => {
    const isGroup = viewScope === 'group';
    const monthExpenses = expenses.filter(
      (e) => e.date.startsWith(selectedMonth) && (isGroup || e.businessId === currentBusiness)
    );

    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    const colors = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#64748B',
      '#F97316',
    ];

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [expenses, selectedMonth, currentBusiness, viewScope]);

  // 6-Month Profit Trend
  const monthlyTrendData = useMemo(() => {
    const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const isGroup = viewScope === 'group';

    return months.map((m, idx) => {
      const mSales = sales.filter((s) => s.date.startsWith(m));
      const mDisp = dispatches.filter((d) => d.date.startsWith(m));
      const mInv = serviceInvoices.filter((sv) => sv.date.startsWith(m));
      const mExp = expenses.filter(
        (e) => e.date.startsWith(m) && (isGroup || e.businessId === currentBusiness)
      );

      const expVal = mExp.reduce((sum, e) => sum + e.amount, 0);

      let rev = 0;
      let grossProfit = 0;

      if (isGroup || currentBusiness === 'sadat') {
        rev += mSales.reduce((sum, s) => sum + s.total, 0) + mInv.reduce((sum, i) => sum + i.totalBill, 0);
        grossProfit += mSales.reduce((sum, s) => sum + s.profit, 0) + mInv.reduce((sum, i) => sum + i.shopProfit, 0);
      }
      if (isGroup || currentBusiness === 'ak') {
        rev += mDisp.reduce((sum, d) => sum + d.total, 0);
        grossProfit += mDisp.reduce((sum, d) => {
          const cost = d.items.reduce((c, i) => c + i.unitCost * i.qty, 0);
          return sum + (d.total - cost);
        }, 0);
      }

      const net = grossProfit - expVal;

      return {
        name: labels[idx],
        Revenue: rev,
        NetProfit: Math.max(0, net),
      };
    });
  }, [sales, dispatches, serviceInvoices, expenses, currentBusiness, viewScope]);

  // Export P&L CSV
  const handleExportStatement = () => {
    const headers = ['Financial Metric', 'Amount (PKR)'];
    const rows = [
      ['Gross Retail Sales', finData.retailGrossSales],
      ['Less: Retail Returns', finData.retailReturns],
      ['Net Retail Sales', finData.retailNetSales],
      ['Cost of Goods Sold (Retail)', finData.retailCogs],
      ['Gross Profit (Retail)', finData.retailProfit],
      ['Wholesale Dispatches', finData.wholesaleGrossSales],
      ['Less: Wholesale Returns', finData.wholesaleReturns],
      ['Net Wholesale Sales', finData.wholesaleNetSales],
      ['Cost of Goods Sold (Wholesale)', finData.wholesaleCogs],
      ['Gross Profit (Wholesale)', finData.wholesaleProfit],
      ['Service Labor Charges', finData.serviceChargesBilled],
      ['Parts Charged to Customer', finData.partsBilled],
      ['Less: Parts Purchase Cost', finData.partsCost],
      ['Less: Technician Commission', finData.technicianCommission],
      ['Net Service Workshop Profit', finData.serviceNetProfit],
      ['Total Operating Expenses', finData.totalOperatingExpenses],
      ['NET PROFIT / (LOSS)', finData.netProfit],
    ];

    exportToCSV(`PL_Statement_${selectedMonth}`, headers, rows);
  };

  // Submit Expense Modal
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim()) return;

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        businessId: expBusinessId,
        category: expCategory,
        description: expDescription.trim(),
        amount: Number(expAmount),
        paidFrom: expPaidFrom,
        date: expDate,
      });
    } else {
      addExpense({
        businessId: expBusinessId,
        category: expCategory,
        description: expDescription.trim(),
        amount: Number(expAmount),
        paidFrom: expPaidFrom,
        date: expDate,
      });
    }

    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profit & Loss Statement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monthly financial performance, expense breakdown and P&L ledger for {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scope Selector: Individual vs Group Total */}
          <div className="flex p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setViewScope('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'current'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentBusiness === 'sadat' ? 'Sadat Electronics' : 'AK Traders'}
            </button>
            <button
              onClick={() => setViewScope('group')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'group'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Group Total (Consolidated)
            </button>
          </div>

          <button
            onClick={handleExportStatement}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-slate-200/70 rounded-xl">
          <button
            onClick={() => setActiveTab('statement')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'statement'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            P&L Statement
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'expenses'
                ? 'bg-white text-[#1E6BFF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operating Expenses ({finData.monthExpenses.length})
          </button>
        </div>

        {activeTab === 'expenses' && (
          <button
            onClick={() => {
              setEditingExpense(null);
              setExpDescription('');
              setExpAmount(10000);
              setExpDate('2026-10-12');
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-xs hover:bg-blue-600"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Expense</span>
          </button>
        )}
      </div>

      {/* 4 Financial Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-slate-900 tabular-nums mt-1 block">
            {formatPKR(finData.totalRevenue)}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-2 block">
            Goods + Services combined
          </span>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Total Expenses
          </span>
          <span className="text-2xl font-black text-rose-600 tabular-nums mt-1 block">
            {formatPKR(finData.totalOperatingExpenses)}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-2 block">
            {finData.monthExpenses.length} operating line items
          </span>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Net Profit
          </span>
          <span
            className={`text-2xl font-black tabular-nums mt-1 block ${
              finData.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPKR(finData.netProfit)}
          </span>
          <span className="text-xs font-semibold text-emerald-600 mt-2 block">
            After COGS, commissions & bills
          </span>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Profit Margin
          </span>
          <span className="text-2xl font-black text-[#1E6BFF] tabular-nums mt-1 block">
            {finData.profitMargin.toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-2 block">
            Net margin on revenue
          </span>
        </div>
      </div>

      {activeTab === 'statement' ? (
        <div className="space-y-6">
          {/* Row: Monthly Profit Trend & Expense Breakdown Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Profit Trend (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Profit Trend (May – Oct 2026)
                </h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#1E6BFF]" />
                    <span className="text-slate-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
                    <span className="text-slate-600">Profit</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatPKR(Number(val)), '']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="Revenue" fill="#1E6BFF" radius={[5, 5, 0, 0]} barSize={20} />
                    <Bar dataKey="NetProfit" fill="#10B981" radius={[5, 5, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Donut (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Expense Breakdown</h3>
                <span className="text-xs text-slate-400 font-semibold">{selectedMonth}</span>
              </div>

              <div className="relative h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatPKR(Number(val)), 'Amount']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Exp</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatPKR(finData.totalOperatingExpenses)}
                  </span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-[11px] max-h-24 overflow-y-auto">
                {expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}</span>
                    <span className="font-bold text-slate-900 ml-auto tabular-nums">
                      {formatPKR(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Formal Financial Statement Table */}
          <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Comprehensive Income & Expenditure Statement
                </h3>
                <p className="text-xs text-slate-500">
                  Scope: {viewScope === 'group' ? 'Sadat Group (Both Units)' : currentBusiness === 'sadat' ? 'Sadat Electronics' : 'AK Traders'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                Period: {selectedMonth}
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs font-medium divide-y divide-slate-150">
              {/* Section 1: Retail Showroom Sales */}
              {(viewScope === 'group' || currentBusiness === 'sadat') && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#1E6BFF]">
                    1. Retail Showroom Revenue (Sadat Electronics)
                  </h4>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Gross Retail Sales</span>
                    <span className="tabular-nums font-semibold">{formatPKR(finData.retailGrossSales)}</span>
                  </div>
                  {finData.retailReturns > 0 && (
                    <div className="flex justify-between text-rose-600 pl-3">
                      <span>Less: Customer Returns & Exchanges</span>
                      <span className="tabular-nums font-semibold">({formatPKR(finData.retailReturns)})</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 pl-3 font-bold">
                    <span>Net Retail Sales</span>
                    <span className="tabular-nums">{formatPKR(finData.retailNetSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pl-3">
                    <span>Less: Cost of Goods Sold (Retail COGS)</span>
                    <span className="tabular-nums">({formatPKR(finData.retailCogs)})</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 pl-3 font-extrabold bg-emerald-50/50 py-1 rounded">
                    <span>Retail Gross Profit</span>
                    <span className="tabular-nums">{formatPKR(finData.retailProfit)}</span>
                  </div>
                </div>
              )}

              {/* Section 2: Wholesale Kitchen Distribution */}
              {(viewScope === 'group' || currentBusiness === 'ak') && (
                <div className="space-y-2 pt-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#16A34A]">
                    2. Wholesale Distribution (AK Traders Kitchen Appliances)
                  </h4>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Wholesale Dealer Dispatches</span>
                    <span className="tabular-nums font-semibold">{formatPKR(finData.wholesaleGrossSales)}</span>
                  </div>
                  {finData.wholesaleReturns > 0 && (
                    <div className="flex justify-between text-rose-600 pl-3">
                      <span>Less: Dealer Returns & Factory Replacements</span>
                      <span className="tabular-nums font-semibold">({formatPKR(finData.wholesaleReturns)})</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 pl-3 font-bold">
                    <span>Net Wholesale Turnover</span>
                    <span className="tabular-nums">{formatPKR(finData.wholesaleNetSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pl-3">
                    <span>Less: Cost of Wholesale Goods (COGS)</span>
                    <span className="tabular-nums">({formatPKR(finData.wholesaleCogs)})</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 pl-3 font-extrabold bg-emerald-50/50 py-1 rounded">
                    <span>Wholesale Gross Profit</span>
                    <span className="tabular-nums">{formatPKR(finData.wholesaleProfit)}</span>
                  </div>
                </div>
              )}

              {/* Section 3: Service & Workshop */}
              {(viewScope === 'group' || currentBusiness === 'sadat') && (
                <div className="space-y-2 pt-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0EA5A4]">
                    3. Workshop & Field Service Operations (Sadat Electronics)
                  </h4>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Labor & Diagnostic Charges Billed</span>
                    <span className="tabular-nums font-semibold">{formatPKR(finData.serviceChargesBilled)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Spare Parts Billed to Customers</span>
                    <span className="tabular-nums font-semibold">{formatPKR(finData.partsBilled)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pl-3">
                    <span>Less: Parts Purchase Cost</span>
                    <span className="tabular-nums">({formatPKR(finData.partsCost)})</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pl-3">
                    <span>Less: Field Technician Commissions</span>
                    <span className="tabular-nums">({formatPKR(finData.technicianCommission)})</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 pl-3 font-extrabold bg-emerald-50/50 py-1 rounded">
                    <span>Workshop Net Contribution</span>
                    <span className="tabular-nums">{formatPKR(finData.serviceNetProfit)}</span>
                  </div>
                </div>
              )}

              {/* Section 4: Operating Expenses */}
              <div className="space-y-2 pt-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#F59E0B]">
                  4. Operating & Administrative Expenses
                </h4>
                {finData.monthExpenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between text-slate-600 pl-3">
                    <span>
                      {exp.category}: {exp.description}
                    </span>
                    <span className="tabular-nums">{formatPKR(exp.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-rose-600 pl-3 font-bold pt-1 border-t border-slate-200">
                  <span>Total Operating Expenses</span>
                  <span className="tabular-nums">({formatPKR(finData.totalOperatingExpenses)})</span>
                </div>
              </div>

              {/* Final Net Line */}
              <div className="pt-4 flex items-center justify-between text-base font-black text-slate-900 bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-lg">NET PROFIT / (LOSS)</span>
                  <p className="text-xs text-slate-500 font-normal">
                    Final bottom-line earnings for {selectedMonth}
                  </p>
                </div>
                <span
                  className={`text-2xl tabular-nums ${
                    finData.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatPKR(finData.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EXPENSES MANAGEMENT TABLE */
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Expense #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Paid From</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {finData.monthExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{e.id}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(e.date)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.businessId === 'sadat'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {e.businessId === 'sadat' ? 'Sadat' : 'AK Traders'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.category}</td>
                    <td className="py-3 px-4 text-slate-600">{e.description}</td>
                    <td className="py-3 px-4 text-slate-500">{e.paidFrom}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingExpense(e);
                          setExpBusinessId(e.businessId);
                          setExpCategory(e.category);
                          setExpDescription(e.description);
                          setExpAmount(e.amount);
                          setExpPaidFrom(e.paidFrom);
                          setExpDate(e.date);
                          setIsExpenseModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Edit Expense"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record Operating Expense'}
        subtitle="Log store rents, staff salaries, K-Electric bills or freight"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Business Entity *
              </label>
              <select
                value={expBusinessId}
                onChange={(e) => setExpBusinessId(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="sadat">Sadat Electronics</option>
                <option value="ak">AK Traders</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Expense Category *
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description / Voucher Notes *
            </label>
            <input
              type="text"
              required
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="e.g. Monthly Showroom Rent, K-Electric Bill"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Amount (Rs.) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Paid From Account
              </label>
              <select
                value={expPaidFrom}
                onChange={(e) => setExpPaidFrom(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="Cash Drawer">Cash Drawer</option>
                <option value="Meezan Bank">Meezan Bank</option>
                <option value="HBL Business Account">HBL Business Account</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Expense Date
            </label>
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
