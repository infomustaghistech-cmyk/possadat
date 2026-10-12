import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  BusinessId,
  MonthKey,
  Product,
  Customer,
  Dealer,
  Technician,
  Sale,
  Complaint,
  ServiceInvoice,
  Dispatch,
  DealerPayment,
  CustomerPayment,
  ReturnRecord,
  PurchaseOrder,
  Expense,
  WhatsAppMessage,
  BusinessConfig,
  NotificationAlert,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_DEALERS,
  INITIAL_TECHNICIANS,
  INITIAL_SALES,
  INITIAL_COMPLAINTS,
  INITIAL_SERVICE_INVOICES,
  INITIAL_DISPATCHES,
  INITIAL_DEALER_PAYMENTS,
  INITIAL_CUSTOMER_PAYMENTS,
  INITIAL_RETURNS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_EXPENSES,
  INITIAL_WHATSAPP_HISTORY,
  BUSINESS_CONFIGS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: string | null;
  hasSelectedBusiness: boolean;
  login: (username: string, pass: string, remember: boolean) => boolean;
  logout: () => void;
  selectBusiness: (id: BusinessId) => void;
  currentBusiness: BusinessId;
  setCurrentBusiness: (id: BusinessId) => void;

  // Time context
  selectedMonth: MonthKey;
  setSelectedMonth: (month: MonthKey) => void;

  // Active view tab
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Data collections
  products: Product[];
  customers: Customer[];
  dealers: Dealer[];
  technicians: Technician[];
  sales: Sale[];
  complaints: Complaint[];
  serviceInvoices: ServiceInvoice[];
  dispatches: Dispatch[];
  dealerPayments: DealerPayment[];
  customerPayments: CustomerPayment[];
  returns: ReturnRecord[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  whatsappHistory: WhatsAppMessage[];
  businessConfigs: Record<string, BusinessConfig>;

  // Calculated stock helper
  getProductStock: (productId: string) => { showroom: number; godown: number; total: number; isLow: boolean };

  // Calculated balances
  getDealerBalance: (dealerId: string) => number;
  getCustomerBalance: (customerId: string) => number;

  // Notifications
  notifications: NotificationAlert[];

  // Mutators / CRUD
  addSale: (saleData: Omit<Sale, 'id' | 'businessId'>) => Sale;
  receiveSalePayment: (saleId: string, amount: number, method: 'Cash' | 'Bank / JazzCash / Easypaisa') => void;
  returnSaleItem: (saleId: string, productId: string, qty: number, reason: string) => void;

  addComplaint: (complaintData: Omit<Complaint, 'id' | 'businessId'>) => Complaint;
  updateComplaintStatus: (complaintId: string, status: Complaint['status']) => void;
  assignComplaintTechnician: (complaintId: string, technicianId: string) => void;
  createRecomplaint: (parentComplaintId: string, issue: string) => Complaint;
  createServiceInvoice: (invoiceData: Omit<ServiceInvoice, 'id'>) => ServiceInvoice;

  addDispatch: (dispatchData: Omit<Dispatch, 'id' | 'businessId'>) => Dispatch;
  addDealerPayment: (paymentData: Omit<DealerPayment, 'id'>) => DealerPayment;
  addDealerReturn: (dispatchId: string, dealerId: string, productId: string, qty: number, reason: string) => void;

  addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'status'>) => PurchaseOrder;
  addProduct: (productData: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => { success: boolean; message?: string };

  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (cust: Customer) => void;

  addDealer: (dealer: Omit<Dealer, 'id' | 'createdAt'>) => Dealer;
  updateDealer: (dealer: Dealer) => void;

  addTechnician: (tech: Omit<Technician, 'id'>) => Technician;
  updateTechnician: (tech: Technician) => void;

  addExpense: (expenseData: Omit<Expense, 'id'>) => Expense;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  sendWhatsAppMessage: (msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>) => void;
  updateBusinessConfig: (id: BusinessId, config: Partial<BusinessConfig>) => void;

  // System
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetToInitialData: () => void;
}

const STORAGE_PREFIX = 'sadat_group_erp_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const remembered = localStorage.getItem(STORAGE_PREFIX + 'auth');
    const session = sessionStorage.getItem(STORAGE_PREFIX + 'auth');
    return remembered === 'true' || session === 'true';
  });

  const [hasSelectedBusiness, setHasSelectedBusiness] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'biz_selected') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'user') || (isAuthenticated ? 'owner' : null);
  });

  const [currentBusiness, setCurrentBusinessState] = useState<BusinessId>(() => {
    return (localStorage.getItem(STORAGE_PREFIX + 'current_biz') as BusinessId) || 'sadat';
  });

  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('2026-10');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core Data Collections with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [dealers, setDealers] = useState<Dealer[]>(() => loadFromStorage('dealers', INITIAL_DEALERS));
  const [technicians, setTechnicians] = useState<Technician[]>(() => loadFromStorage('technicians', INITIAL_TECHNICIANS));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('sales', INITIAL_SALES));
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadFromStorage('complaints', INITIAL_COMPLAINTS));
  const [serviceInvoices, setServiceInvoices] = useState<ServiceInvoice[]>(() => loadFromStorage('invoices', INITIAL_SERVICE_INVOICES));
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => loadFromStorage('dispatches', INITIAL_DISPATCHES));
  const [dealerPayments, setDealerPayments] = useState<DealerPayment[]>(() => loadFromStorage('dealer_payments', INITIAL_DEALER_PAYMENTS));
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => loadFromStorage('cust_payments', INITIAL_CUSTOMER_PAYMENTS));
  const [returns, setReturns] = useState<ReturnRecord[]>(() => loadFromStorage('returns', INITIAL_RETURNS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadFromStorage('pos', INITIAL_PURCHASE_ORDERS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [whatsappHistory, setWhatsappHistory] = useState<WhatsAppMessage[]>(() => loadFromStorage('whatsapp', INITIAL_WHATSAPP_HISTORY));
  const [businessConfigs, setBusinessConfigs] = useState<Record<string, BusinessConfig>>(() => loadFromStorage('biz_configs', BUSINESS_CONFIGS));

  // Sync state to storage
  useEffect(() => { saveToStorage('products', products); }, [products]);
  useEffect(() => { saveToStorage('customers', customers); }, [customers]);
  useEffect(() => { saveToStorage('dealers', dealers); }, [dealers]);
  useEffect(() => { saveToStorage('technicians', technicians); }, [technicians]);
  useEffect(() => { saveToStorage('sales', sales); }, [sales]);
  useEffect(() => { saveToStorage('complaints', complaints); }, [complaints]);
  useEffect(() => { saveToStorage('invoices', serviceInvoices); }, [serviceInvoices]);
  useEffect(() => { saveToStorage('dispatches', dispatches); }, [dispatches]);
  useEffect(() => { saveToStorage('dealer_payments', dealerPayments); }, [dealerPayments]);
  useEffect(() => { saveToStorage('cust_payments', customerPayments); }, [customerPayments]);
  useEffect(() => { saveToStorage('returns', returns); }, [returns]);
  useEffect(() => { saveToStorage('pos', purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { saveToStorage('expenses', expenses); }, [expenses]);
  useEffect(() => { saveToStorage('whatsapp', whatsappHistory); }, [whatsappHistory]);
  useEffect(() => { saveToStorage('biz_configs', businessConfigs); }, [businessConfigs]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth functions
  const login = (username: string, pass: string, remember: boolean): boolean => {
    if (username.trim().toLowerCase() === 'owner' && pass === 'demo123') {
      setIsAuthenticated(true);
      setCurrentUser('owner');
      setHasSelectedBusiness(false);
      localStorage.setItem(STORAGE_PREFIX + 'user', 'owner');
      if (remember) {
        localStorage.setItem(STORAGE_PREFIX + 'auth', 'true');
      } else {
        sessionStorage.setItem(STORAGE_PREFIX + 'auth', 'true');
      }
      addToast('Welcome back, Owner! Signed in successfully.');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHasSelectedBusiness(false);
    localStorage.removeItem(STORAGE_PREFIX + 'auth');
    sessionStorage.removeItem(STORAGE_PREFIX + 'auth');
    localStorage.removeItem(STORAGE_PREFIX + 'user');
    localStorage.removeItem(STORAGE_PREFIX + 'biz_selected');
    addToast('Signed out successfully.', 'info');
  };

  const selectBusiness = (id: BusinessId) => {
    setCurrentBusinessState(id);
    setHasSelectedBusiness(true);
    localStorage.setItem(STORAGE_PREFIX + 'current_biz', id);
    localStorage.setItem(STORAGE_PREFIX + 'biz_selected', 'true');
    setCurrentTab('dashboard');
  };

  const setCurrentBusiness = (id: BusinessId) => {
    setCurrentBusinessState(id);
    localStorage.setItem(STORAGE_PREFIX + 'current_biz', id);
    // If switching to AK Traders while on a retail-only tab, shift to dashboard
    if (id === 'ak' && currentTab === 'service') {
      setCurrentTab('dashboard');
    }
    addToast(`Switched to ${id === 'sadat' ? 'Sadat Electronics' : 'AK Traders'}`);
  };

  // Stock Calculation Engine: base + purchases - sales - dispatches + returns
  const getProductStock = useCallback((productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return { showroom: 0, godown: 0, total: 0, isLow: false };

    // Initial base
    const baseShowroom = p.showroomStock ?? 0;
    const baseGodown = p.godownStock ?? 0;

    // Additional purchases beyond seed data
    const additionalShowroomPurchases = purchaseOrders
      .filter((po) => po.productId === productId && po.destination === 'Showroom' && !INITIAL_PURCHASE_ORDERS.some(init => init.id === po.id))
      .reduce((sum, po) => sum + po.qty, 0);

    const additionalGodownPurchases = purchaseOrders
      .filter((po) => po.productId === productId && po.destination === 'Godown' && !INITIAL_PURCHASE_ORDERS.some(init => init.id === po.id))
      .reduce((sum, po) => sum + po.qty, 0);

    // Sales created in this session (beyond initial seed sales)
    const newSalesQty = sales
      .filter((s) => !INITIAL_SALES.some(init => init.id === s.id))
      .flatMap((s) => s.items)
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.qty, 0);

    // Dispatches created in this session
    const newDispatchesQty = dispatches
      .filter((d) => !INITIAL_DISPATCHES.some(init => init.id === d.id))
      .flatMap((d) => d.items)
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.qty, 0);

    // Returns created in this session
    const newRetailReturns = returns
      .filter((r) => r.type === 'Retail' && r.productId === productId && !INITIAL_RETURNS.some(init => init.id === r.id))
      .reduce((sum, r) => sum + r.qty, 0);

    const newWholesaleReturns = returns
      .filter((r) => r.type === 'Wholesale' && r.productId === productId && !INITIAL_RETURNS.some(init => init.id === r.id))
      .reduce((sum, r) => sum + r.qty, 0);

    const currentShowroom = Math.max(0, baseShowroom + additionalShowroomPurchases - newSalesQty + newRetailReturns);
    const currentGodown = Math.max(0, baseGodown + additionalGodownPurchases - newDispatchesQty + newWholesaleReturns);
    const total = currentShowroom + currentGodown;
    const isLow = total <= p.minLevel;

    return {
      showroom: currentShowroom,
      godown: currentGodown,
      total,
      isLow,
    };
  }, [products, purchaseOrders, sales, dispatches, returns]);

  // Dynamic Dealer Balance Calculation
  const getDealerBalance = useCallback((dealerId: string) => {
    const dealer = dealers.find((d) => d.id === dealerId);
    if (!dealer) return 0;
    const opening = dealer.openingBalance || 0;

    // Dispatches to this dealer
    const totalDispatches = dispatches
      .filter((d) => d.dealerId === dealerId)
      .reduce((sum, d) => sum + d.total, 0);

    // Upfront paid at dispatch
    const totalPaidAtDispatch = dispatches
      .filter((d) => d.dealerId === dealerId)
      .reduce((sum, d) => sum + (d.amountPaidNow || 0), 0);

    // Dealer payments received
    const totalPaymentsReceived = dealerPayments
      .filter((p) => p.dealerId === dealerId)
      .reduce((sum, p) => sum + p.amount, 0);

    // Returns credited
    const totalReturnsCredited = returns
      .filter((r) => r.partyId === dealerId && r.type === 'Wholesale')
      .reduce((sum, r) => sum + r.refundOrCreditAmount, 0);

    return Math.max(0, opening + (totalDispatches - totalPaidAtDispatch) - totalPaymentsReceived - totalReturnsCredited);
  }, [dealers, dispatches, dealerPayments, returns]);

  // Dynamic Customer Balance Calculation
  const getCustomerBalance = useCallback((customerId: string) => {
    const totalUnpaidSales = sales
      .filter((s) => s.customerId === customerId)
      .reduce((sum, s) => sum + (s.balanceAmount || 0), 0);

    const totalRecovered = customerPayments
      .filter((p) => p.customerId === customerId)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalReturned = returns
      .filter((r) => r.partyId === customerId && r.type === 'Retail')
      .reduce((sum, r) => sum + r.refundOrCreditAmount, 0);

    return Math.max(0, totalUnpaidSales - totalRecovered - totalReturned);
  }, [sales, customerPayments, returns]);

  // Notifications alerts
  const notifications = useMemo<NotificationAlert[]>(() => {
    const alerts: NotificationAlert[] = [];

    // Low stock items
    const lowStockItems = products.filter((p) => {
      const stock = getProductStock(p.id);
      return stock.isLow;
    });

    if (lowStockItems.length > 0) {
      alerts.push({
        id: 'low-stock-alert',
        type: 'low_stock',
        title: `${lowStockItems.length} Products Low on Stock`,
        message: `${lowStockItems.map((p) => p.name.split('(')[0].trim()).slice(0, 3).join(', ')}${lowStockItems.length > 3 ? '...' : ''} need reordering.`,
        linkTab: 'inventory',
        severity: 'red',
      });
    }

    // Open complaints
    const openComplaints = complaints.filter(
      (c) => c.status === 'New' || c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Waiting Parts'
    );
    if (openComplaints.length > 0) {
      alerts.push({
        id: 'open-complaints-alert',
        type: 'complaint',
        title: `${openComplaints.length} Active Workshop Complaints`,
        message: `${openComplaints.filter(c => c.status === 'New').length} new and ${openComplaints.filter(c => c.priority === 'High').length} high-priority tasks requiring attention.`,
        linkTab: 'service',
        severity: 'orange',
      });
    }

    // Overdue dealers
    const overdueDealers = dealers.filter((d) => {
      const balance = getDealerBalance(d.id);
      return balance > 200000;
    });
    if (overdueDealers.length > 0) {
      alerts.push({
        id: 'dealer-overdue-alert',
        type: 'dealer_overdue',
        title: `${overdueDealers.length} Dealers with Significant Balance`,
        message: `High ledger balances pending recovery across ${overdueDealers.length} partner accounts.`,
        linkTab: 'wholesale',
        severity: 'red',
      });
    }

    return alerts;
  }, [products, getProductStock, complaints, dealers, getDealerBalance]);

  // ID Generators
  const getNextId = (prefix: string, list: { id: string }[]): string => {
    let max = 0;
    list.forEach((item) => {
      if (item.id.startsWith(prefix)) {
        const num = parseInt(item.id.replace(prefix, ''), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  };

  // Mutators
  const addSale = (saleData: Omit<Sale, 'id' | 'businessId'>): Sale => {
    const id = getNextId('SI-', sales);
    const newSale: Sale = {
      ...saleData,
      id,
      businessId: 'sadat',
    };
    setSales((prev) => [newSale, ...prev]);
    addToast(`${id} created successfully! Showroom stock updated.`);
    return newSale;
  };

  const receiveSalePayment = (saleId: string, amount: number, method: 'Cash' | 'Bank / JazzCash / Easypaisa') => {
    const targetSale = sales.find((s) => s.id === saleId);
    if (!targetSale) return;

    const newPaid = targetSale.paidAmount + amount;
    const newBalance = Math.max(0, targetSale.total - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? { ...s, paidAmount: newPaid, balanceAmount: newBalance, status: newStatus }
          : s
      )
    );

    // Create payment entry
    const payId = getNextId('PAY-', customerPayments);
    const payment: CustomerPayment = {
      id: payId,
      date: '2026-10-12',
      customerId: targetSale.customerId,
      customerName: targetSale.customerName,
      amount,
      method,
      notes: `Received balance for invoice ${saleId}`,
    };
    setCustomerPayments((prev) => [payment, ...prev]);
    addToast(`Payment of Rs. ${amount.toLocaleString()} received for ${saleId}.`);
  };

  const returnSaleItem = (saleId: string, productId: string, qty: number, reason: string) => {
    const sale = sales.find((s) => s.id === saleId);
    const prod = products.find((p) => p.id === productId);
    if (!sale || !prod) return;

    const returnId = getNextId('RT-', returns);
    const refundAmount = prod.retailPrice * qty;

    const retRecord: ReturnRecord = {
      id: returnId,
      date: '2026-10-12',
      businessId: 'sadat',
      type: 'Retail',
      referenceId: saleId,
      partyId: sale.customerId,
      partyName: sale.customerName,
      productId,
      productName: prod.name,
      qty,
      refundOrCreditAmount: refundAmount,
      reason,
    };

    setReturns((prev) => [retRecord, ...prev]);
    addToast(`Return ${returnId} processed. ${qty} unit(s) returned to Showroom.`);
  };

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'businessId'>): Complaint => {
    const id = getNextId('CMP-', complaints);
    const newComplaint: Complaint = {
      ...complaintData,
      id,
      businessId: 'sadat',
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    addToast(`Complaint ${id} logged successfully.`);
    return newComplaint;
  };

  const updateComplaintStatus = (complaintId: string, status: Complaint['status']) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status } : c))
    );
    addToast(`Complaint ${complaintId} status updated to "${status}".`);
  };

  const assignComplaintTechnician = (complaintId: string, technicianId: string) => {
    const tech = technicians.find((t) => t.id === technicianId);
    if (!tech) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              technicianId: tech.id,
              technicianName: tech.name,
              status: c.status === 'New' ? 'Assigned' : c.status,
            }
          : c
      )
    );
    addToast(`Technician ${tech.name} assigned to ${complaintId}.`);
  };

  const createRecomplaint = (parentComplaintId: string, issue: string): Complaint => {
    const parent = complaints.find((c) => c.id === parentComplaintId);
    const id = getNextId('CMP-', complaints);
    const newComplaint: Complaint = {
      id,
      parentComplaintId,
      isRecomplaint: true,
      businessId: 'sadat',
      date: '2026-10-12',
      customerId: parent?.customerId || '',
      customerName: parent?.customerName || '',
      customerPhone: parent?.customerPhone || '',
      customerAddress: parent?.customerAddress || '',
      appliance: parent?.appliance || '',
      brand: parent?.brand || '',
      modelSerial: parent?.modelSerial || '',
      issue,
      priority: 'High',
      technicianId: parent?.technicianId,
      technicianName: parent?.technicianName,
      visitDate: '2026-10-12',
      status: 'Assigned',
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    addToast(`Re-complaint ${id} logged (linked to ${parentComplaintId}).`);
    return newComplaint;
  };

  const createServiceInvoice = (invoiceData: Omit<ServiceInvoice, 'id'>): ServiceInvoice => {
    const id = getNextId('SV-', serviceInvoices);
    const newInvoice: ServiceInvoice = {
      ...invoiceData,
      id,
    };
    setServiceInvoices((prev) => [newInvoice, ...prev]);

    // Update complaint with invoiceId and mark completed
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === invoiceData.complaintId
          ? { ...c, invoiceId: id, status: 'Completed' }
          : c
      )
    );
    addToast(`Service Invoice ${id} created. Shop profit: Rs. ${newInvoice.shopProfit.toLocaleString()}`);
    return newInvoice;
  };

  const addDispatch = (dispatchData: Omit<Dispatch, 'id' | 'businessId'>): Dispatch => {
    const id = getNextId('AK-', dispatches);
    const newDispatch: Dispatch = {
      ...dispatchData,
      id,
      businessId: 'ak',
    };
    setDispatches((prev) => [newDispatch, ...prev]);
    addToast(`Dispatch ${id} issued to ${newDispatch.dealerName}. Godown stock updated.`);
    return newDispatch;
  };

  const addDealerPayment = (paymentData: Omit<DealerPayment, 'id'>): DealerPayment => {
    const id = getNextId('PAY-', dealerPayments);
    const newPayment: DealerPayment = {
      ...paymentData,
      id,
    };
    setDealerPayments((prev) => [newPayment, ...prev]);
    addToast(`Payment ${id} of Rs. ${newPayment.amount.toLocaleString()} recorded for ${newPayment.dealerName}.`);
    return newPayment;
  };

  const addDealerReturn = (dispatchId: string, dealerId: string, productId: string, qty: number, reason: string) => {
    const dealer = dealers.find((d) => d.id === dealerId);
    const prod = products.find((p) => p.id === productId);
    if (!dealer || !prod) return;

    const returnId = getNextId('RT-', returns);
    const creditAmount = prod.wholesalePrice * qty;

    const retRecord: ReturnRecord = {
      id: returnId,
      date: '2026-10-12',
      businessId: 'ak',
      type: 'Wholesale',
      referenceId: dispatchId,
      partyId: dealerId,
      partyName: dealer.name,
      productId,
      productName: prod.name,
      qty,
      refundOrCreditAmount: creditAmount,
      reason,
    };

    setReturns((prev) => [retRecord, ...prev]);
    addToast(`Dealer Return ${returnId} recorded. Godown stock restored.`);
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status'>): PurchaseOrder => {
    const id = getNextId('PO-', purchaseOrders);
    const newPo: PurchaseOrder = {
      ...poData,
      id,
      status: 'Received',
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
    addToast(`PO ${id} received! ${newPo.qty} units added to ${newPo.destination}.`);
    return newPo;
  };

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const id = getNextId('PRD-', products);
    const newProd: Product = {
      ...productData,
      id,
    };
    setProducts((prev) => [...prev, newProd]);
    addToast(`Product "${newProd.name}" added to catalog.`);
    return newProd;
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    addToast(`Product "${product.name}" updated.`);
  };

  const deleteProduct = (productId: string): { success: boolean; message?: string } => {
    // Check if product is used on sales, dispatches, complaints or POs
    const isUsedInSales = sales.some((s) => s.items.some((i) => i.productId === productId));
    const isUsedInDispatches = dispatches.some((d) => d.items.some((i) => i.productId === productId));

    if (isUsedInSales || isUsedInDispatches) {
      addToast('Cannot delete product: it is referenced in past sales or dispatches.', 'error');
      return { success: false, message: 'Product is linked to transaction records.' };
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('Product removed from catalog.');
    return { success: true };
  };

  const addCustomer = (cust: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const id = getNextId('CUST-', customers);
    const newCustomer: Customer = {
      ...cust,
      id,
      createdAt: '2026-10-12',
    };
    setCustomers((prev) => [...prev, newCustomer]);
    addToast(`Customer "${newCustomer.name}" added.`);
    return newCustomer;
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
    addToast(`Customer "${cust.name}" details updated.`);
  };

  const addDealer = (dealer: Omit<Dealer, 'id' | 'createdAt'>): Dealer => {
    const id = getNextId('DLR-', dealers);
    const newDealer: Dealer = {
      ...dealer,
      id,
      createdAt: '2026-10-12',
    };
    setDealers((prev) => [...prev, newDealer]);
    addToast(`Dealer "${newDealer.name}" registered.`);
    return newDealer;
  };

  const updateDealer = (dealer: Dealer) => {
    setDealers((prev) => prev.map((d) => (d.id === dealer.id ? dealer : d)));
    addToast(`Dealer "${dealer.name}" updated.`);
  };

  const addTechnician = (tech: Omit<Technician, 'id'>): Technician => {
    const id = getNextId('TECH-', technicians);
    const newTech: Technician = {
      ...tech,
      id,
    };
    setTechnicians((prev) => [...prev, newTech]);
    addToast(`Technician "${newTech.name}" added.`);
    return newTech;
  };

  const updateTechnician = (tech: Technician) => {
    setTechnicians((prev) => prev.map((t) => (t.id === tech.id ? tech : t)));
    addToast(`Technician "${tech.name}" details updated.`);
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const id = getNextId('EXP-', expenses);
    const newExpense: Expense = {
      ...expenseData,
      id,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addToast(`Expense ${id} of Rs. ${newExpense.amount.toLocaleString()} recorded.`);
    return newExpense;
  };

  const updateExpense = (expense: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
    addToast(`Expense ${expense.id} updated.`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast(`Expense ${id} deleted.`);
  };

  const sendWhatsAppMessage = (msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>) => {
    const id = getNextId('WA-', whatsappHistory);
    const nowIso = new Date().toISOString();
    const newMsg: WhatsAppMessage = {
      ...msg,
      id,
      timestamp: nowIso,
      status: 'Sent',
    };
    setWhatsappHistory((prev) => [newMsg, ...prev]);
    addToast(`WhatsApp message logged for ${newMsg.recipientName}.`);
  };

  const updateBusinessConfig = (id: BusinessId, config: Partial<BusinessConfig>) => {
    setBusinessConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...config,
      },
    }));
    addToast('Business settings updated successfully.');
  };

  // Reset Data Modal action
  const resetToInitialData = () => {
    // Clear all storage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX) && !key.includes('auth') && !key.includes('user')) {
        localStorage.removeItem(key);
      }
    });

    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setDealers(INITIAL_DEALERS);
    setTechnicians(INITIAL_TECHNICIANS);
    setSales(INITIAL_SALES);
    setComplaints(INITIAL_COMPLAINTS);
    setServiceInvoices(INITIAL_SERVICE_INVOICES);
    setDispatches(INITIAL_DISPATCHES);
    setDealerPayments(INITIAL_DEALER_PAYMENTS);
    setCustomerPayments(INITIAL_CUSTOMER_PAYMENTS);
    setReturns(INITIAL_RETURNS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setExpenses(INITIAL_EXPENSES);
    setWhatsappHistory(INITIAL_WHATSAPP_HISTORY);
    setBusinessConfigs(BUSINESS_CONFIGS);
    setSelectedMonth('2026-10');

    addToast('All demo data has been restored to default state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        hasSelectedBusiness,
        login,
        logout,
        selectBusiness,
        currentBusiness,
        setCurrentBusiness,
        selectedMonth,
        setSelectedMonth,
        currentTab,
        setCurrentTab,
        products,
        customers,
        dealers,
        technicians,
        sales,
        complaints,
        serviceInvoices,
        dispatches,
        dealerPayments,
        customerPayments,
        returns,
        purchaseOrders,
        expenses,
        whatsappHistory,
        businessConfigs,
        getProductStock,
        getDealerBalance,
        getCustomerBalance,
        notifications,
        addSale,
        receiveSalePayment,
        returnSaleItem,
        addComplaint,
        updateComplaintStatus,
        assignComplaintTechnician,
        createRecomplaint,
        createServiceInvoice,
        addDispatch,
        addDealerPayment,
        addDealerReturn,
        addPurchaseOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        addDealer,
        updateDealer,
        addTechnician,
        updateTechnician,
        addExpense,
        updateExpense,
        deleteExpense,
        sendWhatsAppMessage,
        updateBusinessConfig,
        toasts,
        addToast,
        removeToast,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
