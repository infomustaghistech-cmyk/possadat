import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, Dealer, Sale, Complaint } from '../../types';
import { formatPKR, formatDate, openWhatsAppLink } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  Wrench,
  Receipt,
  DollarSign,
  Share2,
  Building2,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

export const CustomersDealersScreen: React.FC = () => {
  const {
    customers,
    dealers,
    sales,
    complaints,
    getCustomerBalance,
    getDealerBalance,
    receiveSalePayment,
    addCustomer,
    addDealer,
    setCurrentTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customers' | 'dealers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Receive Customer Balance Modal
  const [balanceCustomer, setBalanceCustomer] = useState<Customer | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [receiveMethod, setReceiveMethod] = useState<'Cash' | 'Bank / JazzCash / Easypaisa'>('Cash');

  // Customer Form Modal
  const [isNewCustOpen, setIsNewCustOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custArea, setCustArea] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.area.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  // Filtered Dealers
  const filteredDealers = useMemo(() => {
    return dealers.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.includes(searchQuery)
    );
  }, [dealers, searchQuery]);

  // Selected customer purchase and service history
  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter((s) => s.customerId === selectedCustomer.id);
  }, [selectedCustomer, sales]);

  const customerComplaints = useMemo(() => {
    if (!selectedCustomer) return [];
    return complaints.filter((c) => c.customerId === selectedCustomer.id);
  }, [selectedCustomer, complaints]);

  // Handle Receive Payment for customer
  const handleReceiveCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceCustomer) return;
    // Find earliest unpaid sale for this customer
    const unpaidSale = sales.find((s) => s.customerId === balanceCustomer.id && s.balanceAmount > 0);
    if (unpaidSale) {
      receiveSalePayment(unpaidSale.id, receiveAmount, receiveMethod);
    }
    setBalanceCustomer(null);
  };

  // Handle Add Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim(),
      area: custArea.trim() || 'Karachi',
      address: custAddress.trim() || 'Karachi, Pakistan',
    });

    setIsNewCustOpen(false);
    setCustName('');
    setCustPhone('');
    setCustArea('');
    setCustAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customers & Wholesale Dealers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Profiles, purchase & warranty histories, khata balances and direct WhatsApp communication
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customers'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retail Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('dealers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dealers'
                  ? 'bg-white text-[#1E6BFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wholesale Dealers ({dealers.length})
            </button>
          </div>

          {activeTab === 'customers' && (
            <button
              onClick={() => setIsNewCustOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-xs hover:bg-blue-600"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={
            activeTab === 'customers'
              ? 'Search customer by name, area, phone number...'
              : 'Search dealer by store name, city, contact person...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6ECF3] bg-white text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#1E6BFF]"
        />
      </div>

      {activeTab === 'customers' ? (
        /* CUSTOMERS TABLE */
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Area / Town</th>
                  <th className="py-3 px-4 text-center">Purchases</th>
                  <th className="py-3 px-4 text-center">Service Tickets</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.map((c) => {
                  const custSales = sales.filter((s) => s.customerId === c.id);
                  const custJobs = complaints.filter((cmp) => cmp.customerId === c.id);
                  const bal = getCustomerBalance(c.id);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.address}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{c.phone}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{c.area}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {custSales.length} Bills
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                          {custJobs.length} Jobs
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold tabular-nums">
                        <span className={bal > 0 ? 'text-amber-600' : 'text-slate-400'}>
                          {formatPKR(bal)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E6BFF] hover:bg-blue-100 font-bold text-[11px] transition-colors"
                        >
                          History
                        </button>
                        {bal > 0 && (
                          <button
                            onClick={() => {
                              setBalanceCustomer(c);
                              setReceiveAmount(bal);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          >
                            Receive
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const text = `Dear ${c.name}, greetings from SADAT GROUP Karachi! Regarding your account: current pending balance is ${formatPKR(bal)}. Contact us at +92 21 34981122.`;
                            openWhatsAppLink(c.phone, text);
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[11px]"
                          title="WhatsApp Chat"
                        >
                          WA
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DEALERS TABLE */
        <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Dealer Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-center">Credit Terms</th>
                  <th className="py-3 px-4 text-right">Khata Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDealers.map((d) => {
                  const bal = getDealerBalance(d.id);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="text-[11px] text-slate-400">{d.address}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{d.contactPerson}</td>
                      <td className="py-3 px-4 text-slate-600">{d.city}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{d.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {d.creditTermsDays} Days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-600 tabular-nums">
                        {formatPKR(bal)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setCurrentTab('wholesale');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E6BFF] hover:bg-blue-100 font-bold text-[11px] transition-colors"
                        >
                          Open Ledger →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL HISTORY DRAWER / MODAL */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Customer Profile: ${selectedCustomer?.name}`}
        subtitle={`Phone: ${selectedCustomer?.phone} • Area: ${selectedCustomer?.area}`}
        maxWidth="3xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Balance Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase block">
                  Current Khata Balance
                </span>
                <span className="text-2xl font-black text-rose-600 tabular-nums">
                  {formatPKR(getCustomerBalance(selectedCustomer.id))}
                </span>
              </div>
              {getCustomerBalance(selectedCustomer.id) > 0 && (
                <button
                  onClick={() => {
                    setBalanceCustomer(selectedCustomer);
                    setReceiveAmount(getCustomerBalance(selectedCustomer.id));
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Receive Balance Payment
                </button>
              )}
            </div>

            {/* Sales Invoices List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Retail Sales History ({customerSales.length})
              </h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {customerSales.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No showroom purchases recorded yet.
                  </div>
                ) : (
                  customerSales.map((s) => (
                    <div key={s.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{s.id}</span>
                        <span className="text-slate-400 ml-2">{formatDate(s.date)}</span>
                        <p className="text-slate-600 mt-0.5">
                          {s.items.map((i) => `${i.productName} (${i.qty})`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 block tabular-nums">
                          {formatPKR(s.total)}
                        </span>
                        <span className="text-emerald-600 font-bold text-[11px]">
                          Paid: {formatPKR(s.paidAmount)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Service Complaints List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Workshop Service History ({customerComplaints.length})
              </h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {customerComplaints.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No workshop complaints logged.
                  </div>
                ) : (
                  customerComplaints.map((c) => (
                    <div key={c.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{c.id}</span>
                        <span className="text-slate-500 font-semibold ml-2">{c.appliance}</span>
                        <p className="text-slate-500 mt-0.5">{c.issue}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.status}
                        </span>
                        <span className="text-slate-400 block text-[10px] mt-1">
                          {c.technicianName || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* RECEIVE CUSTOMER BALANCE MODAL */}
      <Modal
        isOpen={!!balanceCustomer}
        onClose={() => setBalanceCustomer(null)}
        title={`Receive Payment: ${balanceCustomer?.name}`}
        subtitle={`Outstanding Khata Balance: ${formatPKR(
          balanceCustomer ? getCustomerBalance(balanceCustomer.id) : 0
        )}`}
      >
        <form onSubmit={handleReceiveCustomerPayment} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Amount (Rs.) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={receiveAmount}
              onChange={(e) => setReceiveAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Payment Method
            </label>
            <select
              value={receiveMethod}
              onChange={(e) => setReceiveMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              <option value="Cash">Cash</option>
              <option value="Bank / JazzCash / Easypaisa">Bank / JazzCash / Easypaisa</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setBalanceCustomer(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Post Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD CUSTOMER MODAL */}
      <Modal
        isOpen={isNewCustOpen}
        onClose={() => setIsNewCustOpen(false)}
        title="Add Customer"
        subtitle="Save retail customer profile"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              required
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Area / Town
            </label>
            <input
              type="text"
              value={custArea}
              onChange={(e) => setCustArea(e.target.value)}
              placeholder="e.g. DHA Phase 6"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Address
            </label>
            <input
              type="text"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              placeholder="House, Street details"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewCustOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
