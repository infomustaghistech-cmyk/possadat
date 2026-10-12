import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint, Dispatch } from '../../types';
import { formatPKR, formatCompactPKR, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Wrench,
  Receipt,
  BadgeDollarSign,
  Truck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardScreen: React.FC = () => {
  const {
    currentBusiness,
    selectedMonth,
    sales,
    dispatches,
    serviceInvoices,
    complaints,
    expenses,
    dealerPayments,
    customerPayments,
    products,
    dealers,
    customers,
    setCurrentTab,
    getProductStock,
    getDealerBalance,
    getCustomerBalance,
  } = useApp();

  const isSadat = currentBusiness === 'sadat';

  // Calculations for current selectedMonth (e.g. '2026-10')
  const metrics = useMemo(() => {
    // Current month sales / dispatches
    const monthSales = sales.filter((s) => s.date.startsWith(selectedMonth));
    const monthDispatches = dispatches.filter((d) => d.date.startsWith(selectedMonth));
    const monthInvoices = serviceInvoices.filter((sv) => sv.date.startsWith(selectedMonth));
    const monthExpenses = expenses.filter(
      (e) => e.date.startsWith(selectedMonth) && e.businessId === currentBusiness
    );
    const monthDealerPayments = dealerPayments.filter((p) => p.date.startsWith(selectedMonth));

    // Previous month calculation
    const [yearStr, mStr] = selectedMonth.split('-');
    const prevMonthNum = parseInt(mStr, 10) - 1;
    const prevMonthKey = prevMonthNum < 1 ? '2026-05' : `2026-${String(prevMonthNum).padStart(2, '0')}`;

    const prevSales = sales.filter((s) => s.date.startsWith(prevMonthKey));
    const prevDispatches = dispatches.filter((d) => d.date.startsWith(prevMonthKey));
    const prevInvoices = serviceInvoices.filter((sv) => sv.date.startsWith(prevMonthKey));
    const prevExpenses = expenses.filter(
      (e) => e.date.startsWith(prevMonthKey) && e.businessId === currentBusiness
    );
    const prevDealerPayments = dealerPayments.filter((p) => p.date.startsWith(prevMonthKey));

    if (isSadat) {
      const totalSalesRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
      const totalServiceRevenue = monthInvoices.reduce((sum, sv) => sum + sv.totalBill, 0);
      const totalExpensesAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Profit = Goods Profit + Workshop Shop Profit - Expenses
      const goodsProfit = monthSales.reduce((sum, s) => sum + s.profit, 0);
      const serviceShopProfit = monthInvoices.reduce((sum, sv) => sum + sv.shopProfit, 0);
      const netProfit = goodsProfit + serviceShopProfit - totalExpensesAmount;

      // Previous month
      const prevSalesRev = prevSales.reduce((sum, s) => sum + s.total, 0);
      const prevServRev = prevInvoices.reduce((sum, sv) => sum + sv.totalBill, 0);
      const prevExp = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
      const prevProfit =
        prevSales.reduce((sum, s) => sum + s.profit, 0) +
        prevInvoices.reduce((sum, sv) => sum + sv.shopProfit, 0) -
        prevExp;

      const salesGrowth = prevSalesRev > 0 ? ((totalSalesRevenue - prevSalesRev) / prevSalesRev) * 100 : 12;
      const serviceGrowth = prevServRev > 0 ? ((totalServiceRevenue - prevServRev) / prevServRev) * 100 : 8;
      const expenseChange = prevExp > 0 ? ((totalExpensesAmount - prevExp) / prevExp) * 100 : -2;
      const profitGrowth = prevProfit > 0 ? ((netProfit - prevProfit) / prevProfit) * 100 : 15;

      return {
        card1Title: 'Total Sales',
        card1Value: totalSalesRevenue,
        card1Growth: salesGrowth,
        card2Title: 'Service Revenue',
        card2Value: totalServiceRevenue,
        card2Growth: serviceGrowth,
        card3Title: 'Expenses',
        card3Value: totalExpensesAmount,
        card3Growth: expenseChange,
        card4Title: 'Net Profit',
        card4Value: netProfit,
        card4Growth: profitGrowth,
        goodsProfit,
        serviceShopProfit,
      };
    } else {
      // AK Traders metrics
      const totalDispatchesVal = monthDispatches.reduce((sum, d) => sum + d.total, 0);
      const totalRecovery = monthDealerPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalExpensesAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Wholesale Profit = (Wholesale Total - Unit Cost) - Expenses
      const wholesaleGrossProfit = monthDispatches.reduce((sum, d) => {
        const cost = d.items.reduce((c, item) => c + item.unitCost * item.qty, 0);
        return sum + (d.total - cost);
      }, 0);
      const netProfit = wholesaleGrossProfit - totalExpensesAmount;

      const prevDispVal = prevDispatches.reduce((sum, d) => sum + d.total, 0);
      const prevRecov = prevDealerPayments.reduce((sum, p) => sum + p.amount, 0);
      const prevExp = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
      const prevWholesaleProfit =
        prevDispatches.reduce((sum, d) => {
          const cost = d.items.reduce((c, item) => c + item.unitCost * item.qty, 0);
          return sum + (d.total - cost);
        }, 0) - prevExp;

      const dispGrowth = prevDispVal > 0 ? ((totalDispatchesVal - prevDispVal) / prevDispVal) * 100 : 14;
      const recovGrowth = prevRecov > 0 ? ((totalRecovery - prevRecov) / prevRecov) * 100 : 11;
      const expenseChange = prevExp > 0 ? ((totalExpensesAmount - prevExp) / prevExp) * 100 : -3;
      const profitGrowth = prevWholesaleProfit > 0 ? ((netProfit - prevWholesaleProfit) / prevWholesaleProfit) * 100 : 16;

      return {
        card1Title: 'Total Dispatch',
        card1Value: totalDispatchesVal,
        card1Growth: dispGrowth,
        card2Title: 'Dealer Recovery',
        card2Value: totalRecovery,
        card2Growth: recovGrowth,
        card3Title: 'Expenses',
        card3Value: totalExpensesAmount,
        card3Growth: expenseChange,
        card4Title: 'Net Profit',
        card4Value: netProfit,
        card4Growth: profitGrowth,
        goodsProfit: wholesaleGrossProfit,
        serviceShopProfit: 0,
      };
    }
  }, [sales, dispatches, serviceInvoices, expenses, dealerPayments, selectedMonth, currentBusiness, isSadat]);

  // 6-Month Chart Data
  const monthlyChartData = useMemo(() => {
    const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

    return months.map((m, idx) => {
      const mExp = expenses
        .filter((e) => e.date.startsWith(m) && e.businessId === currentBusiness)
        .reduce((sum, e) => sum + e.amount, 0);

      if (isSadat) {
        const mSales = sales.filter((s) => s.date.startsWith(m));
        const mInvoices = serviceInvoices.filter((sv) => sv.date.startsWith(m));
        const rev =
          mSales.reduce((sum, s) => sum + s.total, 0) +
          mInvoices.reduce((sum, sv) => sum + sv.totalBill, 0);
        const profit =
          mSales.reduce((sum, s) => sum + s.profit, 0) +
          mInvoices.reduce((sum, sv) => sum + sv.shopProfit, 0) -
          mExp;
        return {
          name: labels[idx],
          Revenue: rev,
          NetProfit: Math.max(0, profit),
        };
      } else {
        const mDisp = dispatches.filter((d) => d.date.startsWith(m));
        const rev = mDisp.reduce((sum, d) => sum + d.total, 0);
        const profit =
          mDisp.reduce((sum, d) => {
            const cost = d.items.reduce((c, item) => c + item.unitCost * item.qty, 0);
            return sum + (d.total - cost);
          }, 0) - mExp;
        return {
          name: labels[idx],
          Revenue: rev,
          NetProfit: Math.max(0, profit),
        };
      }
    });
  }, [sales, dispatches, serviceInvoices, expenses, currentBusiness, isSadat]);

  // Donut chart breakdown
  const donutData = useMemo(() => {
    if (isSadat) {
      const goods = Math.max(0, metrics.goodsProfit);
      const service = Math.max(0, metrics.serviceShopProfit);
      return [
        { name: 'Goods Sale', value: goods, color: '#1E5071' },
        { name: 'Service Workshop', value: service, color: '#2C6D98' },
      ];
    } else {
      const wholesale = Math.max(0, metrics.goodsProfit);
      const recoveryCollected = dealerPayments
        .filter((p) => p.date.startsWith(selectedMonth))
        .reduce((sum, p) => sum + p.amount, 0);
      return [
        { name: 'Appliance Sales', value: wholesale, color: '#1E5071' },
        { name: 'Cash Recovery', value: recoveryCollected, color: '#2C6D98' },
      ];
    }
  }, [isSadat, metrics, dealerPayments, selectedMonth]);

  // Complaints / Dispatch Pipeline breakdown
  const complaintsPipeline = useMemo(() => {
    const statuses: Complaint['status'][] = [
      'New',
      'Assigned',
      'In Progress',
      'Waiting Parts',
      'Completed',
      'Closed',
    ];
    const colors: Record<string, string> = {
      New: 'bg-blue-500',
      Assigned: 'bg-purple-500',
      'In Progress': 'bg-sky-500',
      'Waiting Parts': 'bg-amber-500',
      Completed: 'bg-emerald-500',
      Closed: 'bg-slate-400',
    };

    return statuses.map((st) => ({
      status: st,
      count: complaints.filter((c) => c.status === st).length,
      color: colors[st],
    }));
  }, [complaints]);

  const dispatchPipeline = useMemo(() => {
    const statuses: Dispatch['status'][] = [
      'Dispatched',
      'Partially Paid',
      'Paid',
      'Returned',
    ];
    const colors: Record<string, string> = {
      Dispatched: 'bg-blue-500',
      'Partially Paid': 'bg-amber-500',
      Paid: 'bg-emerald-500',
      Returned: 'bg-rose-500',
    };

    return statuses.map((st) => ({
      status: st,
      count: dispatches.filter((d) => d.status === st).length,
      color: colors[st],
    }));
  }, [dispatches]);

  // Alerts data
  const lowStockCount = useMemo(() => {
    return products.filter((p) => getProductStock(p.id).isLow).length;
  }, [products, getProductStock]);

  const pendingCustomersCount = useMemo(() => {
    return customers.filter((c) => getCustomerBalance(c.id) > 0).length;
  }, [customers, getCustomerBalance]);

  const overdueDealersCount = useMemo(() => {
    return dealers.filter((d) => getDealerBalance(d.id) > 150000).length;
  }, [dealers, getDealerBalance]);

  // Latest activities
  const latestSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  const latestDispatches = useMemo(() => {
    return dispatches.slice(0, 5);
  }, [dispatches]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs md:text-sm mt-0.5">
            Real-time business performance overview for {isSadat ? 'Sadat Electronics' : 'AK Traders'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-[11px] sm:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1E5071]" />
            <span>Today: 12 Oct 2026</span>
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Tiles Styled with Sadat Electronics Logo Colors (2x2 on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* KPI Tile 1: Total Sales / Dispatch (Deep Navy Blue #1E5071) */}
        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#1E5071] to-[#25628A] px-3 py-2 sm:px-4 sm:py-2.5 text-white flex items-center justify-between font-bold">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider truncate">
              {metrics.card1Title}
            </span>
            {isSadat ? <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" /> : <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />}
          </div>
          <div className="p-3 sm:p-5">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums truncate">
              {formatPKR(metrics.card1Value)}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 mt-1 sm:mt-2 truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>↑ {metrics.card1Growth.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* KPI Tile 2: Service Revenue / Recovery (Secondary Blue #2C6D98) */}
        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#2C6D98] to-[#3683B8] px-3 py-2 sm:px-4 sm:py-2.5 text-white flex items-center justify-between font-bold">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider truncate">
              {metrics.card2Title}
            </span>
            {isSadat ? <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" /> : <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />}
          </div>
          <div className="p-3 sm:p-5">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums truncate">
              {formatPKR(metrics.card2Value)}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 mt-1 sm:mt-2 truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>↑ {metrics.card2Growth.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* KPI Tile 3: Expenses (Dark Blue-Gray #143B55) */}
        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#143B55] to-[#1A4B6E] px-3 py-2 sm:px-4 sm:py-2.5 text-white flex items-center justify-between font-bold">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider truncate">
              {metrics.card3Title}
            </span>
            <BadgeDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
          </div>
          <div className="p-3 sm:p-5">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums truncate">
              {formatPKR(metrics.card3Value)}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 sm:mt-2 truncate">
              <span>{metrics.card3Growth >= 0 ? `↑ ${metrics.card3Growth.toFixed(1)}%` : `↓ ${Math.abs(metrics.card3Growth).toFixed(1)}%`}</span>
            </div>
          </div>
        </div>

        {/* KPI Tile 4: Net Profit (Deep Blue Crest #0E273C) */}
        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#0E273C] to-[#163E5C] px-3 py-2 sm:px-4 sm:py-2.5 text-white flex items-center justify-between font-bold">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider truncate">
              {metrics.card4Title}
            </span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
          </div>
          <div className="p-3 sm:p-5">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums truncate">
              {formatPKR(metrics.card4Value)}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 mt-1 sm:mt-2 truncate">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>↑ {metrics.card4Growth.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Three Cards (Profit Source Donut, Complaints/Dispatch Pipeline, Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Profit Source Donut */}
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Profit Source</h3>
            <span className="text-[11px] font-semibold text-slate-400">Monthly</span>
          </div>

          <div className="relative h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatPKR(Number(val)), 'Amount']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Net Profit Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatCompactPKR(metrics.card4Value)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {donutData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{formatCompactPKR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Complaints Pipeline / Dispatch Status */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {isSadat ? 'Complaints Pipeline' : 'Dispatch Status'}
            </h3>
            <button
              onClick={() => setCurrentTab(isSadat ? 'service' : 'wholesale')}
              className="text-xs font-semibold text-[#1E5071] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            {isSadat
              ? complaintsPipeline.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-slate-700">{item.status}</span>
                    </div>
                    <span className="font-bold text-slate-900 px-2 py-0.5 rounded-full bg-slate-100">
                      {item.count}
                    </span>
                  </div>
                ))
              : dispatchPipeline.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-slate-700">{item.status}</span>
                    </div>
                    <span className="font-bold text-slate-900 px-2 py-0.5 rounded-full bg-slate-100">
                      {item.count}
                    </span>
                  </div>
                ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Total active lifecycle cases updated in real-time
          </div>
        </div>

        {/* Card 3: Priority System Alerts */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Operational Alerts</h3>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>

          <div className="space-y-3.5 flex-1">
            {/* Low stock alert */}
            <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {lowStockCount} items low on stock
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Critical replenishment needed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('inventory')}
                className="text-[11px] font-bold text-[#1E5071] hover:underline shrink-0"
              >
                View Stock →
              </button>
            </div>

            {/* Pending customers alert */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {pendingCustomersCount} customers pending balance
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Partial payments to recover
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('customers')}
                className="text-[11px] font-bold text-amber-800 hover:underline shrink-0"
              >
                View Customers →
              </button>
            </div>

            {/* Overdue dealers alert */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {overdueDealersCount} wholesale dealers outstanding
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Exceeding standard credit threshold
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('wholesale')}
                className="text-[11px] font-bold text-[#1E5071] hover:underline shrink-0"
              >
                View Dealers →
              </button>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            System monitors limits across Karachi & Sindh network
          </div>
        </div>
      </div>

      {/* Row 3: 6-Month Chart & Latest Sales Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[14px] border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Revenue vs Net Profit Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                6-month historic performance (May – Oct 2026)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#1E5071]" />
                <span className="text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#2C6D98]" />
                <span className="text-slate-600">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatPKR(Number(val)), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="Revenue" fill="#1E5071" radius={[6, 6, 0, 0]} barSize={22} />
                <Bar dataKey="NetProfit" fill="#2C6D98" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Activity Table */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {isSadat ? 'Latest Retail Sales' : 'Latest Dispatches'}
            </h3>
            <button
              onClick={() => setCurrentTab(isSadat ? 'sales' : 'wholesale')}
              className="text-xs font-semibold text-[#1E5071] hover:underline"
            >
              See History
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isSadat
              ? latestSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sale.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium mt-0.5 truncate max-w-[150px]">
                        {sale.customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 tabular-nums block">
                        {formatPKR(sale.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(sale.date)}
                      </span>
                    </div>
                  </div>
                ))
              : latestDispatches.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{disp.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            disp.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {disp.status}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium mt-0.5 truncate max-w-[150px]">
                        {disp.dealerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 tabular-nums block">
                        {formatPKR(disp.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(disp.date)}
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-center text-slate-400">
            Click on any item in History for invoice & returns
          </div>
        </div>
      </div>
    </div>
  );
};
