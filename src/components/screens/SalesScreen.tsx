import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, SaleItem, Sale, ProductCategory } from '../../types';
import { formatPKR, formatDate, openWhatsAppLink } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Receipt,
  Share2,
  DollarSign,
  UserPlus,
  Clock,
  Printer,
  X,
  CreditCard,
  Banknote,
  Package,
  ArrowLeft,
  Phone,
} from 'lucide-react';

export const SalesScreen: React.FC = () => {
  const {
    products,
    customers,
    sales,
    addSale,
    receiveSalePayment,
    returnSaleItem,
    addCustomer,
    getProductStock,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [posMobileView, setPosMobileView] = useState<'catalog' | 'cart'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // POS State
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank / JazzCash / Easypaisa'>('Cash');
  const [paidNowInput, setPaidNowInput] = useState<string>('');

  // Quick New Customer Modal
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustArea, setNewCustArea] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [custFormError, setCustFormError] = useState('');

  // View Invoice Modal
  const [viewInvoice, setViewInvoice] = useState<Sale | null>(null);

  // Return Modal
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [returnProductId, setReturnProductId] = useState<string>('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>('');

  // Receive Balance Modal
  const [balanceSale, setBalanceSale] = useState<Sale | null>(null);
  const [balancePaymentAmount, setBalancePaymentAmount] = useState<number>(0);
  const [balancePaymentMethod, setBalancePaymentMethod] = useState<'Cash' | 'Bank / JazzCash / Easypaisa'>('Cash');

  // History search & filters
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Credit'>('All');

  // Categories list
  const categories = [
    'All',
    'Air Conditioner',
    'Refrigerator',
    'Washing Machine',
    'LED TV',
    'Kitchen Appliances',
    'Small Appliances',
  ];

  // Filtered Products for POS
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Show products suitable for retail (both or sadat)
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.retailPrice * item.qty, 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const paidNow = paidNowInput === '' ? grandTotal : Math.min(grandTotal, Math.max(0, Number(paidNowInput)));
  const balanceOwed = Math.max(0, grandTotal - paidNow);

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const stockInfo = getProductStock(product.id);
    const inShowroom = stockInfo.showroom;

    const existing = cart.find((i) => i.product.id === product.id);
    const currentQtyInCart = existing ? existing.qty : 0;

    if (currentQtyInCart + 1 > inShowroom) {
      addToast(`Cannot add: only ${inShowroom} unit(s) available in Showroom!`, 'error');
      return;
    }

    if (existing) {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCart((prev) => [...prev, { product, qty: 1 }]);
    }
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const stockInfo = getProductStock(productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.qty + delta;
            if (nextQty > stockInfo.showroom) {
              addToast(`Only ${stockInfo.showroom} units available in Showroom!`, 'error');
              return item;
            }
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; qty: number }[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Complete POS Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      addToast('Cart is empty. Add products to continue.', 'error');
      return;
    }
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      addToast('Please select a customer.', 'error');
      return;
    }

    // Verify stock availability for all lines
    for (const item of cart) {
      const stock = getProductStock(item.product.id);
      if (item.qty > stock.showroom) {
        addToast(`Not enough showroom stock for ${item.product.name} (Available: ${stock.showroom})`, 'error');
        return;
      }
    }

    const saleItems: SaleItem[] = cart.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      qty: i.qty,
      unitPrice: i.product.retailPrice,
      unitCost: i.product.costPrice,
      total: i.product.retailPrice * i.qty,
    }));

    const totalCost = cart.reduce((sum, i) => sum + i.product.costPrice * i.qty, 0);
    const profit = grandTotal - totalCost;
    const status: Sale['status'] = balanceOwed === 0 ? 'Paid' : paidNow > 0 ? 'Partial' : 'Credit';

    const newSale = addSale({
      date: '2026-10-12',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: saleItems,
      subtotal,
      discount: discountAmount,
      total: grandTotal,
      paidAmount: paidNow,
      balanceAmount: balanceOwed,
      paymentMethod,
      status,
      profit,
    });

    // Reset POS
    setCart([]);
    setDiscountAmount(0);
    setPaidNowInput('');
    setPosMobileView('catalog');
    setViewInvoice(newSale);
  };

  // Quick Customer Creation
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      setCustFormError('Customer name is required.');
      return;
    }
    if (!newCustPhone.trim()) {
      setCustFormError('Phone number is required.');
      return;
    }

    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      area: newCustArea.trim() || 'Karachi',
      address: newCustAddress.trim() || 'Karachi, Pakistan',
    });

    setSelectedCustomerId(created.id);
    setIsNewCustModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustArea('');
    setNewCustAddress('');
    setCustFormError('');
  };

  // Filtered Sales History
  const filteredSalesHistory = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(historySearch.toLowerCase()) ||
        s.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        s.customerPhone.includes(historySearch);
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sales, historySearch, statusFilter]);

  // Handle WhatsApp invoice share
  const handleShareWhatsApp = (sale: Sale) => {
    const text = `Dear ${sale.customerName}, thank you for shopping at SADAT ELECTRONICS!\nInvoice: ${sale.id}\nDate: ${formatDate(sale.date)}\nTotal: ${formatPKR(sale.total)}\nPaid: ${formatPKR(sale.paidAmount)}\nBalance: ${formatPKR(sale.balanceAmount)}\nWarranty & inquiries: +92 21 34981122.`;
    openWhatsAppLink(sale.customerPhone, text);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Navigation Tabs & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Retail POS & Sales
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Sadat Electronics Showroom Point of Sale & Billing Management
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pos'
                  ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Sale (POS)
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales History ({sales.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewCustModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#1E5071]" />
            <span>+ Customer</span>
          </button>
        </div>
      </div>

      {/* POS VIEW */}
      {activeTab === 'pos' ? (
        <div className="space-y-4">
          {/* Mobile Sub-Navigation Segment (Visible ONLY on mobile / tablet < lg) */}
          <div className="lg:hidden flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setPosMobileView('catalog')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                posMobileView === 'catalog'
                  ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products ({filteredProducts.length})</span>
            </button>
            <button
              onClick={() => setPosMobileView('cart')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
                posMobileView === 'cart'
                  ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart ({cart.reduce((s, i) => s + i.qty, 0)})</span>
              {cart.length > 0 && (
                <span className="text-[11px] font-black text-[#8EC5EA] tabular-nums">
                  • {formatPKR(grandTotal)}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Category Column (Horizontal chips on mobile, vertical sidebar on desktop) */}
            <div
              className={`lg:col-span-2 ${
                posMobileView === 'catalog' ? 'flex' : 'hidden lg:flex'
              } lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-2 bg-white rounded-[14px] border border-slate-200 shadow-xs no-scrollbar`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block px-2 mb-1">
                Categories
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 lg:py-2 rounded-xl text-xs font-semibold transition-all shrink-0 lg:w-full lg:text-left ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Middle Product Catalog Grid (6 cols) */}
            <div
              className={`lg:col-span-6 space-y-3.5 ${
                posMobileView === 'catalog' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search product by name, brand, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5071]"
                />
              </div>

              {/* Products Grid (Row style on mobile like screenshot, cards on tablet/desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1 pb-20 lg:pb-0">
                {filteredProducts.map((p) => {
                  const stock = getProductStock(p.id);
                  const isOutOfStock = stock.showroom <= 0;
                  const itemInCart = cart.find((i) => i.product.id === p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddToCart(p)}
                      className={`bg-white rounded-xl border p-3 flex sm:flex-col flex-row items-center sm:items-stretch gap-3 sm:gap-2 justify-between transition-all group ${
                        isOutOfStock
                          ? 'opacity-60 border-slate-200 cursor-not-allowed'
                          : 'border-slate-200 hover:border-[#1E5071] hover:shadow-md cursor-pointer'
                      } ${itemInCart ? 'ring-2 ring-[#1E5071] bg-[#EBF2F7]/50' : ''}`}
                    >
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 flex-1 min-w-0">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-full sm:h-28 rounded-lg overflow-hidden bg-slate-100 sm:mb-2.5 relative shrink-0">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <span
                            className={`hidden sm:inline-block absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700'
                                : stock.isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            Stock: {stock.showroom}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                              {p.brand}
                            </span>
                            {itemInCart && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#1E5071] text-white">
                                in cart: {itemInCart.qty}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate sm:line-clamp-2 leading-tight">
                            {p.name}
                          </h4>
                          <span className="sm:hidden text-[10px] text-slate-400 font-medium">
                            Stock: {stock.showroom}
                          </span>
                        </div>
                      </div>

                      <div className="sm:mt-3 sm:pt-2 sm:border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-[#1E5071] tabular-nums">
                          {formatPKR(p.retailPrice)}
                        </span>
                        <button
                          disabled={isOutOfStock}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-[#EBF2F7] text-[#1E5071] border border-[#D8E5EE] group-hover:bg-[#1E5071] group-hover:text-white'
                          }`}
                          title="Add to sale"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right "Current Sale" Panel (4 cols on desktop, full view on mobile when tab is cart) */}
            <div
              className={`lg:col-span-4 bg-white rounded-[14px] border border-slate-200 shadow-md p-4 sm:p-5 space-y-4 ${
                posMobileView === 'cart' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Mobile Back to Products Bar */}
              <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-100">
                <button
                  onClick={() => setPosMobileView('catalog')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Add More Items</span>
                </button>
                <span className="text-xs font-black text-slate-800">
                  {cart.reduce((s, i) => s + i.qty, 0)} Item(s)
                </span>
              </div>

              <div className="hidden lg:flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-700" />
                  <h3 className="text-sm font-bold text-slate-900">Current Sale</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {cart.length} Item(s)
                </span>
              </div>

              {/* Customer Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Select Customer
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustModalOpen(true)}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    + New
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5071]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone} - {c.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="max-h-60 sm:max-h-56 overflow-y-auto space-y-2.5 divide-y divide-slate-100 pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                    <p>Cart is empty.</p>
                    <button
                      onClick={() => setPosMobileView('catalog')}
                      className="lg:hidden px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  cart.map(({ product, qty }) => (
                    <div key={product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {formatPKR(product.retailPrice)} × {qty}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => handleUpdateQty(product.id, -1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-slate-800 tabular-nums text-xs">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(product.id, 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Calculations */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatPKR(subtotal)}</span>
                </div>

                {/* Discount Input */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">Apply Discount (Rs.)</span>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-right font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#1E5071]"
                  />
                </div>

                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="text-[#1E5071] tabular-nums font-black">{formatPKR(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method Buttons */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Payment Mode
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'Cash'
                        ? 'bg-[#16A34A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank / JazzCash / Easypaisa')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'Bank / JazzCash / Easypaisa'
                        ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank / Online</span>
                  </button>
                </div>
              </div>

              {/* Amount Received Now (Partial payment / Khata support) */}
              <div className="bg-[#EBF2F7] p-3 rounded-xl border border-[#D8E5EE] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Amount Received Now</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    placeholder={grandTotal.toString()}
                    value={paidNowInput}
                    onChange={(e) => setPaidNowInput(e.target.value)}
                    className="w-28 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-right font-extrabold text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-[#1E5071]"
                  />
                </div>

                {/* Quick Shortcuts for Amount Received */}
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setPaidNowInput(grandTotal.toString())}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#D8E5EE] text-[10px] font-bold text-slate-700 hover:bg-[#EBF2F7]"
                  >
                    Full (Rs. {grandTotal.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidNowInput('0')}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#D8E5EE] text-[10px] font-bold text-slate-700 hover:bg-[#EBF2F7]"
                  >
                    Khata / 0
                  </button>
                </div>

                <div className="flex justify-between font-bold text-slate-600 pt-1 border-t border-[#D8E5EE]">
                  <span>Remaining Khata Balance:</span>
                  <span className={balanceOwed > 0 ? 'text-amber-700 font-extrabold' : 'text-emerald-600 font-bold'}>
                    {formatPKR(balanceOwed)}
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white hover:opacity-95 shadow-[#1E5071]/20 active:scale-[0.99] cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Complete Sale & Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Sticky Floating Bottom Bar for Mobile POS (Visible ONLY on mobile when viewing catalog with items in cart) */}
          {posMobileView === 'catalog' && cart.length > 0 && (
            <div className="fixed bottom-3 left-3 right-3 z-30 lg:hidden bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#143B55] to-[#1E5071] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {cart.reduce((sum, i) => sum + i.qty, 0)}
                </div>
                <div>
                  <p className="text-[10px] text-slate-300 font-medium">
                    {cart.length} item(s) selected
                  </p>
                  <p className="text-sm font-black text-white tabular-nums">
                    {formatPKR(grandTotal)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPosMobileView('cart')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Checkout</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SALES HISTORY VIEW */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 sm:p-4 rounded-[14px] border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search invoice #, customer name, phone..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1E5071]"
              />
            </div>

            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Status:</span>
              {(['All', 'Paid', 'Partial', 'Credit'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    statusFilter === st
                      ? 'bg-gradient-to-r from-[#1E5071] via-[#245D83] to-[#2C6D98] text-white shadow-2xs font-extrabold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop / Tablet Table (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4 text-right">Total</th>
                    <th className="py-3.5 px-4 text-right">Paid</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSalesHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No sales found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSalesHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.id}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(s.date)}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{s.customerName}</p>
                          <p className="text-[11px] text-slate-400">{s.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {s.items.map((i) => `${i.productName} (${i.qty})`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                          {formatPKR(s.total)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-bold tabular-nums">
                          {formatPKR(s.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums">
                          <span className={s.balanceAmount > 0 ? 'text-amber-700 font-extrabold' : 'text-slate-400'}>
                            {formatPKR(s.balanceAmount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : s.status === 'Partial'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setViewInvoice(s)}
                            className="px-2 py-1 rounded-lg bg-[#EBF2F7] border border-[#D8E5EE] text-[#1E5071] hover:bg-[#1E5071] hover:text-white font-bold text-[11px] transition-colors"
                          >
                            View
                          </button>
                          {s.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setBalanceSale(s);
                                setBalancePaymentAmount(s.balanceAmount);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReturnSale(s);
                              setReturnProductId(s.items[0]?.productId || '');
                              setReturnQty(1);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition-colors"
                          >
                            Return
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(s)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[11px] transition-colors"
                            title="Send on WhatsApp"
                          >
                            WA
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Invoice Cards (Visible ONLY on mobile screens < md) */}
          <div className="block md:hidden space-y-3">
            {filteredSalesHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No sales found matching search criteria.
              </div>
            ) : (
              filteredSalesHistory.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
                >
                  {/* Top Bar: Invoice ID, Date & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{s.id}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(s.date)}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.status === 'Partial'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{s.customerName}</p>
                      <p className="text-[11px] text-slate-400">{s.customerPhone}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {s.paymentMethod}
                    </span>
                  </div>

                  {/* Items purchased */}
                  <div className="bg-slate-50/80 rounded-lg p-2 text-xs text-slate-600 space-y-1 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Items ({s.items.length}):
                    </span>
                    {s.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700 truncate pr-2">
                          • {i.productName} × {i.qty}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {formatPKR(i.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Amount Breakdown 3-col pill */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total</span>
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        {formatPKR(s.total)}
                      </span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Paid</span>
                      <span className="text-xs font-black text-emerald-700 tabular-nums">
                        {formatPKR(s.paidAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Balance</span>
                      <span
                        className={`text-xs font-black tabular-nums ${
                          s.balanceAmount > 0 ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        {formatPKR(s.balanceAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setViewInvoice(s)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                    {s.balanceAmount > 0 && (
                      <button
                        onClick={() => {
                          setBalanceSale(s);
                          setBalancePaymentAmount(s.balanceAmount);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setReturnSale(s);
                        setReturnProductId(s.items[0]?.productId || '');
                        setReturnQty(1);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      title="Return item"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(s)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK NEW CUSTOMER MODAL */}
      <Modal
        isOpen={isNewCustModalOpen}
        onClose={() => setIsNewCustModalOpen(false)}
        title="Add Walk-in Customer"
        subtitle="Quickly register customer profile for instant POS invoicing"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          {custFormError && (
            <p className="text-xs text-red-600 font-semibold">{custFormError}</p>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Farooq Sattar"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#1E6BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Phone Number (Pakistani 03xx) *
            </label>
            <input
              type="text"
              required
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#1E6BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Area / Town
            </label>
            <input
              type="text"
              value={newCustArea}
              onChange={(e) => setNewCustArea(e.target.value)}
              placeholder="e.g. Gulshan-e-Iqbal Block 7"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#1E6BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Address
            </label>
            <input
              type="text"
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              placeholder="Street / House details"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#1E6BFF]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewCustModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW INVOICE MODAL */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title={`Sales Receipt: ${viewInvoice?.id}`}
        subtitle="Official Sadat Electronics Retail Tax / Cash Memo"
        maxWidth="2xl"
      >
        {viewInvoice && (
          <div className="space-y-4 sm:space-y-6">
            {/* Printable Memo View */}
            <div className="p-3.5 sm:p-6 bg-[#F4F8FA] rounded-2xl border border-slate-200 space-y-4 sm:space-y-5 text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3 sm:pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0E273C]">SADAT ELECTRONICS</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Main Rashid Minhas Road, Gulshan-e-Iqbal, Karachi
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500">Phone: +92 21 34981122 • NTN: 7412890-3</p>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold text-[#1E5071] block">{viewInvoice.id}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">{formatDate(viewInvoice.date)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer:</span>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{viewInvoice.customerName}</p>
                  <p className="text-slate-600 text-[11px]">{viewInvoice.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Payment Mode:</span>
                  <p className="font-bold text-slate-900 text-xs">{viewInvoice.paymentMethod}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 inline-block mt-0.5">
                    {viewInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="py-2 text-left">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2 font-medium">{item.productName}</td>
                        <td className="py-2 text-center font-bold">{item.qty}</td>
                        <td className="py-2 text-right tabular-nums">{formatPKR(item.unitPrice)}</td>
                        <td className="py-2 text-right font-bold tabular-nums">{formatPKR(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-bold tabular-nums">{formatPKR(viewInvoice.subtotal)}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-bold tabular-nums">-{formatPKR(viewInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Bill Total:</span>
                  <span className="text-[#1E5071] tabular-nums font-black">{formatPKR(viewInvoice.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Paid Amount:</span>
                  <span className="tabular-nums">{formatPKR(viewInvoice.paidAmount)}</span>
                </div>
                {viewInvoice.balanceAmount > 0 && (
                  <div className="flex justify-between font-bold text-amber-600">
                    <span>Remaining Balance:</span>
                    <span className="tabular-nums">{formatPKR(viewInvoice.balanceAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => handleShareWhatsApp(viewInvoice)}
                className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send WhatsApp Receipt</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* SALE RETURN MODAL */}
      <Modal
        isOpen={!!returnSale}
        onClose={() => setReturnSale(null)}
        title={`Process Sale Return: ${returnSale?.id}`}
        subtitle="Restores inventory stock back to showroom and credits customer"
      >
        {returnSale && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              returnSaleItem(returnSale.id, returnProductId, returnQty, returnReason);
              setReturnSale(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Item to Return
              </label>
              <select
                value={returnProductId}
                onChange={(e) => setReturnProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              >
                {returnSale.items.map((i) => (
                  <option key={i.productId} value={i.productId}>
                    {i.productName} (Sold: {i.qty} units)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Return Quantity
              </label>
              <input
                type="number"
                min="1"
                max={returnSale.items.find((i) => i.productId === returnProductId)?.qty || 1}
                value={returnQty}
                onChange={(e) => setReturnQty(Number(e.target.value))}
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
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Size miscalculation, exchanged for another model"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturnSale(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Return & Restock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* RECEIVE BALANCE MODAL */}
      <Modal
        isOpen={!!balanceSale}
        onClose={() => setBalanceSale(null)}
        title={`Receive Balance Payment: ${balanceSale?.id}`}
        subtitle={`Pending balance on bill: ${formatPKR(balanceSale?.balanceAmount || 0)}`}
      >
        {balanceSale && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              receiveSalePayment(balanceSale.id, balancePaymentAmount, balancePaymentMethod);
              setBalanceSale(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                disabled
                value={balanceSale.customerName}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Amount (Rs.) *
              </label>
              <input
                type="number"
                min="1"
                max={balanceSale.balanceAmount}
                required
                value={balancePaymentAmount}
                onChange={(e) => setBalancePaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Payment Method
              </label>
              <select
                value={balancePaymentMethod}
                onChange={(e) => setBalancePaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              >
                <option value="Cash">Cash</option>
                <option value="Bank / JazzCash / Easypaisa">Bank / JazzCash / Easypaisa</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBalanceSale(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
