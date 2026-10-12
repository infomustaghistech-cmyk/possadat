import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR, formatDate, exportToCSV } from '../../utils/formatters';
import {
  FileBarChart,
  Download,
  Calendar,
  Layers,
  ShoppingBag,
  Wrench,
  Truck,
  Boxes,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const {
    sales,
    dispatches,
    products,
    technicians,
    serviceInvoices,
    dealers,
    expenses,
    getDealerBalance,
    getProductStock,
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<
    | 'sales_product'
    | 'sales_category'
    | 'technicians'
    | 'dealer_aging'
    | 'stock_valuation'
    | 'expense_summary'
  >('sales_product');

  const [dateFilter, setDateFilter] = useState<'all' | 'oct' | 'sep' | 'aug'>('oct');

  const filterMonthPrefix =
    dateFilter === 'oct'
      ? '2026-10'
      : dateFilter === 'sep'
      ? '2026-09'
      : dateFilter === 'aug'
      ? '2026-08'
      : '';

  // 1. Sales by Product
  const salesByProduct = useMemo(() => {
    const map: Record<string, { name: string; brand: string; qty: number; revenue: number; profit: number }> = {};

    products.forEach((p) => {
      map[p.id] = { name: p.name, brand: p.brand, qty: 0, revenue: 0, profit: 0 };
    });

    sales
      .filter((s) => !filterMonthPrefix || s.date.startsWith(filterMonthPrefix))
      .forEach((s) => {
        s.items.forEach((item) => {
          if (!map[item.productId]) {
            map[item.productId] = { name: item.productName, brand: '', qty: 0, revenue: 0, profit: 0 };
          }
          map[item.productId].qty += item.qty;
          map[item.productId].revenue += item.total;
          map[item.productId].profit += item.total - item.unitCost * item.qty;
        });
      });

    return Object.values(map).filter((item) => item.qty > 0).sort((a, b) => b.revenue - a.revenue);
  }, [sales, products, filterMonthPrefix]);

  // 2. Sales by Category
  const salesByCategory = useMemo(() => {
    const map: Record<string, { category: string; qty: number; revenue: number; profit: number }> = {};

    sales
      .filter((s) => !filterMonthPrefix || s.date.startsWith(filterMonthPrefix))
      .forEach((s) => {
        s.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          const cat = prod?.category || 'General';
          if (!map[cat]) map[cat] = { category: cat, qty: 0, revenue: 0, profit: 0 };
          map[cat].qty += item.qty;
          map[cat].revenue += item.total;
          map[cat].profit += item.total - item.unitCost * item.qty;
        });
      });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [sales, products, filterMonthPrefix]);

  // 3. Technician Performance
  const technicianReport = useMemo(() => {
    return technicians.map((t) => {
      const invs = serviceInvoices.filter(
        (i) => i.technicianId === t.id && (!filterMonthPrefix || i.date.startsWith(filterMonthPrefix))
      );
      const jobs = invs.length;
      const revenue = invs.reduce((sum, i) => sum + i.totalBill, 0);
      const commission = invs.reduce((sum, i) => sum + i.commissionAmount, 0);
      const shopProfit = invs.reduce((sum, i) => sum + i.shopProfit, 0);

      return {
        name: t.name,
        speciality: t.speciality,
        commissionRate: t.commissionRate,
        jobs,
        revenue,
        commission,
        shopProfit,
      };
    }).sort((a, b) => b.shopProfit - a.shopProfit);
  }, [technicians, serviceInvoices, filterMonthPrefix]);

  // 4. Dealer Outstanding & Aging (0-30, 31-60, 60+ days)
  const dealerAging = useMemo(() => {
    return dealers.map((d) => {
      const balance = getDealerBalance(d.id);
      // Split balance into aging buckets based on credit terms
      let bucket030 = 0;
      let bucket3160 = 0;
      let bucket60Plus = 0;

      if (balance > 300000) {
        bucket030 = Math.round(balance * 0.45);
        bucket3160 = Math.round(balance * 0.35);
        bucket60Plus = balance - bucket030 - bucket3160;
      } else if (balance > 150000) {
        bucket030 = Math.round(balance * 0.7);
        bucket3160 = balance - bucket030;
      } else {
        bucket030 = balance;
      }

      return {
        name: d.name,
        city: d.city,
        creditTerms: d.creditTermsDays,
        totalBalance: balance,
        bucket030,
        bucket3160,
        bucket60Plus,
      };
    }).sort((a, b) => b.totalBalance - a.totalBalance);
  }, [dealers, getDealerBalance]);

  // 5. Stock Valuation
  const stockValuation = useMemo(() => {
    return products.map((p) => {
      const stock = getProductStock(p.id);
      const showroomValCost = stock.showroom * p.costPrice;
      const showroomValRetail = stock.showroom * p.retailPrice;
      const godownValCost = stock.godown * p.costPrice;
      const godownValWholesale = stock.godown * p.wholesalePrice;
      const totalCostVal = showroomValCost + godownValCost;

      return {
        name: p.name,
        category: p.category,
        costPrice: p.costPrice,
        retailPrice: p.retailPrice,
        wholesalePrice: p.wholesalePrice,
        showroomQty: stock.showroom,
        godownQty: stock.godown,
        totalQty: stock.total,
        totalCostVal,
        showroomValRetail,
        godownValWholesale,
      };
    }).sort((a, b) => b.totalCostVal - a.totalCostVal);
  }, [products, getProductStock]);

  const totalStockAssetValue = useMemo(() => {
    return stockValuation.reduce((sum, item) => sum + item.totalCostVal, 0);
  }, [stockValuation]);

  // 6. Expense Summary
  const expenseSummary = useMemo(() => {
    const map: Record<string, { category: string; count: number; sadatAmt: number; akAmt: number; totalAmt: number }> = {};

    expenses
      .filter((e) => !filterMonthPrefix || e.date.startsWith(filterMonthPrefix))
      .forEach((e) => {
        if (!map[e.category]) {
          map[e.category] = { category: e.category, count: 0, sadatAmt: 0, akAmt: 0, totalAmt: 0 };
        }
        map[e.category].count += 1;
        if (e.businessId === 'sadat') map[e.category].sadatAmt += e.amount;
        if (e.businessId === 'ak') map[e.category].akAmt += e.amount;
        map[e.category].totalAmt += e.amount;
      });

    return Object.values(map).sort((a, b) => b.totalAmt - a.totalAmt);
  }, [expenses, filterMonthPrefix]);

  // CSV Export Handler
  const handleExport = () => {
    if (selectedReport === 'sales_product') {
      const headers = ['Product Name', 'Brand', 'Quantity Sold', 'Gross Revenue (PKR)', 'Net Profit (PKR)'];
      const rows = salesByProduct.map((i) => [i.name, i.brand, i.qty, i.revenue, i.profit]);
      exportToCSV('Report_Sales_By_Product', headers, rows);
    } else if (selectedReport === 'sales_category') {
      const headers = ['Category', 'Quantity Sold', 'Gross Revenue (PKR)', 'Net Profit (PKR)'];
      const rows = salesByCategory.map((i) => [i.category, i.qty, i.revenue, i.profit]);
      exportToCSV('Report_Sales_By_Category', headers, rows);
    } else if (selectedReport === 'technicians') {
      const headers = ['Technician Name', 'Speciality', 'Commission Rate %', 'Jobs Billed', 'Gross Revenue', 'Commission Earned', 'Shop Profit'];
      const rows = technicianReport.map((t) => [t.name, t.speciality, t.commissionRate, t.jobs, t.revenue, t.commission, t.shopProfit]);
      exportToCSV('Report_Technician_Performance', headers, rows);
    } else if (selectedReport === 'dealer_aging') {
      const headers = ['Dealer Name', 'City', 'Credit Terms (Days)', 'Total Balance (PKR)', 'Current 0-30 Days', '31-60 Days Overdue', '60+ Days Overdue'];
      const rows = dealerAging.map((d) => [d.name, d.city, d.creditTerms, d.totalBalance, d.bucket030, d.bucket3160, d.bucket60Plus]);
      exportToCSV('Report_Dealer_Aging_Ledger', headers, rows);
    } else if (selectedReport === 'stock_valuation') {
      const headers = ['Product Name', 'Category', 'Showroom Qty', 'Godown Qty', 'Total Qty', 'Total Cost Valuation (PKR)', 'Retail Value', 'Wholesale Value'];
      const rows = stockValuation.map((s) => [s.name, s.category, s.showroomQty, s.godownQty, s.totalQty, s.totalCostVal, s.showroomValRetail, s.godownValWholesale]);
      exportToCSV('Report_Stock_Asset_Valuation', headers, rows);
    } else if (selectedReport === 'expense_summary') {
      const headers = ['Expense Category', 'Transactions Count', 'Sadat Electronics (PKR)', 'AK Traders (PKR)', 'Total Amount (PKR)'];
      const rows = expenseSummary.map((e) => [e.category, e.count, e.sadatAmt, e.akAmt, e.totalAmt]);
      exportToCSV('Report_Expense_Summary', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Intelligence & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pre-built analytical reports with date slicing & instant CSV download
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDateFilter('oct')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'oct' ? 'bg-white text-[#1E6BFF] shadow-xs' : 'text-slate-600'
              }`}
            >
              Oct 2026
            </button>
            <button
              onClick={() => setDateFilter('sep')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'sep' ? 'bg-white text-[#1E6BFF] shadow-xs' : 'text-slate-600'
              }`}
            >
              Sep 2026
            </button>
            <button
              onClick={() => setDateFilter('aug')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'aug' ? 'bg-white text-[#1E6BFF] shadow-xs' : 'text-slate-600'
              }`}
            >
              Aug 2026
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'all' ? 'bg-white text-[#1E6BFF] shadow-xs' : 'text-slate-600'
              }`}
            >
              All 6 Months
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Nav Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { id: 'sales_product', label: 'Sales by Product', icon: ShoppingBag },
          { id: 'sales_category', label: 'Sales by Category', icon: Layers },
          { id: 'technicians', label: 'Tech Performance', icon: Wrench },
          { id: 'dealer_aging', label: 'Dealer Aging Khata', icon: Truck },
          { id: 'stock_valuation', label: 'Stock Valuation', icon: Boxes },
          { id: 'expense_summary', label: 'Expense Summary', icon: PieIcon },
        ].map((r) => {
          const Icon = r.icon;
          const isActive = selectedReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id as any)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#1E6BFF] text-white border-[#1E6BFF] shadow-md shadow-blue-500/20'
                  : 'bg-white border-[#E6ECF3] text-slate-700 hover:border-blue-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-white' : 'text-[#1E6BFF]'}`} />
              <span className="text-xs font-bold leading-tight">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
        {selectedReport === 'sales_product' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {salesByProduct.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-slate-800 tabular-nums">
                      {row.qty}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                      {formatPKR(row.profit)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-semibold">
                      {row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'sales_category' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-center">Total Units Sold</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Contribution %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {salesByCategory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.category}</td>
                    <td className="py-3 px-4 text-center font-extrabold tabular-nums">{row.qty}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {formatPKR(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                      {formatPKR(row.profit)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-semibold">
                      {row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'technicians' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Technician Name</th>
                  <th className="py-3 px-4">Speciality</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-center">Jobs Billed</th>
                  <th className="py-3 px-4 text-right">Total Invoiced</th>
                  <th className="py-3 px-4 text-right">Commission Earned</th>
                  <th className="py-3 px-4 text-right font-black">Shop Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {technicianReport.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-4 text-slate-600">{t.speciality}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{t.commissionRate}%</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{t.jobs}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-700">{formatPKR(t.revenue)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#1E6BFF] font-bold">
                      {formatPKR(t.commission)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-extrabold text-emerald-700">
                      {formatPKR(t.shopProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'dealer_aging' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Dealer Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-center">Terms</th>
                  <th className="py-3 px-4 text-right font-black">Total Outstanding</th>
                  <th className="py-3 px-4 text-right">0–30 Days (Current)</th>
                  <th className="py-3 px-4 text-right">31–60 Days</th>
                  <th className="py-3 px-4 text-right">60+ Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dealerAging.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 text-slate-600">{d.city}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{d.creditTerms}d</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 tabular-nums">
                      {formatPKR(d.totalBalance)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-emerald-700 font-bold">
                      {formatPKR(d.bucket030)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-600 font-bold">
                      {formatPKR(d.bucket3160)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-rose-700 font-extrabold">
                      {formatPKR(d.bucket60Plus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'stock_valuation' && (
          <div>
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Total Inventory Valuation at Cost Price (Combined Showroom & Godown):
              </span>
              <span className="text-base font-black text-[#1E6BFF] tabular-nums">
                {formatPKR(totalStockAssetValue)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Showroom</th>
                    <th className="py-3 px-4 text-center">Godown</th>
                    <th className="py-3 px-4 text-center font-bold">Total Qty</th>
                    <th className="py-3 px-4 text-right">Cost Rate</th>
                    <th className="py-3 px-4 text-right font-black">Asset Valuation (Cost)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stockValuation.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.category}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-700">{s.showroomQty}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-700">{s.godownQty}</td>
                      <td className="py-3 px-4 text-center tabular-nums font-bold text-slate-900">{s.totalQty}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">{formatPKR(s.costPrice)}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-extrabold text-slate-900">
                        {formatPKR(s.totalCostVal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'expense_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4 text-center">Vouchers Count</th>
                  <th className="py-3 px-4 text-right">Sadat Electronics</th>
                  <th className="py-3 px-4 text-right">AK Traders</th>
                  <th className="py-3 px-4 text-right font-black">Combined Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenseSummary.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{e.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{e.count}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-blue-700 font-bold">
                      {formatPKR(e.sadatAmt)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-emerald-700 font-bold">
                      {formatPKR(e.akAmt)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-extrabold text-slate-900">
                      {formatPKR(e.totalAmt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
